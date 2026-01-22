-- Helper function to get product price based on store tier
CREATE OR REPLACE FUNCTION get_product_price(
  p_product_id UUID,
  p_store_tier store_tier
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_base_price DECIMAL(10, 2);
  v_gold_price DECIMAL(10, 2);
  v_silver_price DECIMAL(10, 2);
BEGIN
  SELECT base_price, gold_price, silver_price
  INTO v_base_price, v_gold_price, v_silver_price
  FROM products
  WHERE id = p_product_id;
  
  RETURN CASE p_store_tier
    WHEN 'gold' THEN COALESCE(v_gold_price, v_base_price)
    WHEN 'silver' THEN COALESCE(v_silver_price, v_base_price)
    ELSE v_base_price
  END;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create a view for products with computed pricing
CREATE OR REPLACE VIEW products_with_pricing AS
SELECT 
  p.*,
  COALESCE(p.gold_price, p.base_price) as effective_gold_price,
  COALESCE(p.silver_price, p.base_price) as effective_silver_price,
  c.name as category_name,
  c.slug as category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- Function to search products (full text search)
CREATE OR REPLACE FUNCTION search_products(search_query TEXT)
RETURNS TABLE (
  id UUID,
  sku TEXT,
  name TEXT,
  description TEXT,
  category_id UUID,
  base_price DECIMAL(10, 2),
  stock_quantity INTEGER,
  stock_status stock_status,
  image_url TEXT,
  is_active BOOLEAN,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.sku,
    p.name,
    p.description,
    p.category_id,
    p.base_price,
    p.stock_quantity,
    p.stock_status,
    p.image_url,
    p.is_active,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || p.sku),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM products p
  WHERE to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || p.sku) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add text search index for better performance
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN (
  to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || sku)
);

COMMENT ON FUNCTION get_product_price IS 'Returns the appropriate price for a product based on store tier';
COMMENT ON FUNCTION search_products IS 'Full-text search across products by name, description, and SKU';
