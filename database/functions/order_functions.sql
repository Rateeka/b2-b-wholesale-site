-- Function to generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate order number: ORD-YYYYMMDD-XXXX
    new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_number) INTO exists_check;
    
    -- If it doesn't exist, we can use it
    IF NOT exists_check THEN
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_totals(p_order_id UUID)
RETURNS TABLE (
  subtotal DECIMAL(12, 2),
  total_amount DECIMAL(12, 2)
) AS $$
DECLARE
  v_subtotal DECIMAL(12, 2);
  v_shipping DECIMAL(10, 2);
  v_tax DECIMAL(10, 2);
  v_discount DECIMAL(10, 2);
BEGIN
  -- Calculate subtotal from order items
  SELECT COALESCE(SUM(oi.subtotal), 0)
  INTO v_subtotal
  FROM order_items oi
  WHERE oi.order_id = p_order_id;
  
  -- Get shipping, tax, and discount from orders table
  SELECT o.shipping_cost, o.tax_amount, o.discount_amount
  INTO v_shipping, v_tax, v_discount
  FROM orders o
  WHERE o.id = p_order_id;
  
  -- Return calculated values
  RETURN QUERY SELECT 
    v_subtotal,
    v_subtotal + COALESCE(v_shipping, 0) + COALESCE(v_tax, 0) - COALESCE(v_discount, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger function to auto-calculate order totals when items change
CREATE OR REPLACE FUNCTION update_order_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal DECIMAL(12, 2);
  v_total DECIMAL(12, 2);
BEGIN
  SELECT subtotal, total_amount
  INTO v_subtotal, v_total
  FROM calculate_order_totals(
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.order_id
      ELSE NEW.order_id
    END
  );
  
  UPDATE orders
  SET 
    subtotal = v_subtotal,
    total_amount = v_total,
    updated_at = NOW()
  WHERE id = CASE 
    WHEN TG_OP = 'DELETE' THEN OLD.order_id
    ELSE NEW.order_id
  END;
  
  RETURN CASE 
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on order_items
DROP TRIGGER IF EXISTS trigger_update_order_totals ON order_items;
CREATE TRIGGER trigger_update_order_totals
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_totals();

-- Function to check and update stock on order
CREATE OR REPLACE FUNCTION check_product_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_stock_quantity INTEGER;
BEGIN
  SELECT stock_quantity INTO v_stock_quantity
  FROM products
  WHERE id = p_product_id;
  
  RETURN v_stock_quantity >= p_quantity;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to reserve stock when order is confirmed
CREATE OR REPLACE FUNCTION reserve_order_stock(p_order_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Reduce stock for each order item
  UPDATE products p
  SET 
    stock_quantity = p.stock_quantity - oi.quantity,
    stock_status = CASE
      WHEN p.stock_quantity - oi.quantity <= 0 THEN 'out_of_stock'::stock_status
      WHEN p.stock_quantity - oi.quantity <= p.low_stock_threshold THEN 'low_stock'::stock_status
      ELSE p.stock_status
    END,
    updated_at = NOW()
  FROM order_items oi
  WHERE oi.order_id = p_order_id
    AND oi.product_id = p.id;
    
  -- Create inventory transactions
  INSERT INTO inventory_transactions (
    product_id,
    transaction_type,
    quantity_change,
    quantity_before,
    quantity_after,
    reference_type,
    reference_id,
    notes
  )
  SELECT 
    oi.product_id,
    'sale',
    -oi.quantity,
    p.stock_quantity + oi.quantity,
    p.stock_quantity,
    'order',
    p_order_id,
    'Stock reserved for order ' || o.order_number
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  JOIN orders o ON oi.order_id = o.id
  WHERE oi.order_id = p_order_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_order_number IS 'Generates unique order number in format ORD-YYYYMMDD-XXXX';
COMMENT ON FUNCTION calculate_order_totals IS 'Calculates order subtotal and total amount from items';
COMMENT ON FUNCTION check_product_stock IS 'Checks if product has sufficient stock for quantity';
COMMENT ON FUNCTION reserve_order_stock IS 'Reduces product stock and creates inventory transactions for confirmed order';
