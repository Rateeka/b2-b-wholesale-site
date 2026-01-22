-- Teetoz B2B Wholesale Platform Database Schema
-- Complete database setup with tables, indexes, triggers, RLS policies, and functions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'retailer', 'manager');

-- Store/Retailer status
CREATE TYPE store_status AS ENUM ('active', 'pending', 'inactive', 'suspended');

-- Store tiers (pricing tiers)
CREATE TYPE store_tier AS ENUM ('gold', 'silver', 'standard');

-- Store types
CREATE TYPE store_type AS ENUM ('grocery_store', 'restaurant', 'distributor', 'other');

-- Stock status
CREATE TYPE stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'discontinued');

-- Order status
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled');

-- Payment status
CREATE TYPE payment_status AS ENUM ('unpaid', 'partial', 'paid', 'overdue', 'refunded');

-- Invoice status
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'retailer',
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores/Retailers table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    store_type store_type NOT NULL,
    tier store_tier DEFAULT 'standard',
    status store_status DEFAULT 'pending',
    
    -- Address information
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT NOT NULL,
    province TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Canada',
    
    -- Credit management
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    credit_used DECIMAL(12, 2) DEFAULT 0,
    
    -- Business information
    business_number TEXT,
    tax_number TEXT,
    account_manager TEXT,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT credit_limit_positive CHECK (credit_limit >= 0),
    CONSTRAINT credit_used_positive CHECK (credit_used >= 0),
    CONSTRAINT credit_used_within_limit CHECK (credit_used <= credit_limit)
);

-- Product categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Unit and packaging
    unit TEXT NOT NULL, -- e.g., "Case (4x 1kg)", "Box (12 pcs)"
    unit_quantity INTEGER DEFAULT 1,
    
    -- Base pricing (standard tier)
    base_price DECIMAL(10, 2) NOT NULL,
    
    -- Tier pricing
    gold_price DECIMAL(10, 2),
    silver_price DECIMAL(10, 2),
    
    -- Cost and margins
    cost_price DECIMAL(10, 2),
    
    -- Stock management
    stock_quantity INTEGER DEFAULT 0,
    stock_status stock_status DEFAULT 'in_stock',
    low_stock_threshold INTEGER DEFAULT 50,
    reorder_point INTEGER DEFAULT 25,
    
    -- Product details
    weight DECIMAL(8, 2), -- in kg
    dimensions_length DECIMAL(8, 2), -- in cm
    dimensions_width DECIMAL(8, 2),
    dimensions_height DECIMAL(8, 2),
    
    -- Product images
    image_url TEXT,
    image_urls TEXT[], -- array of image URLs
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT base_price_positive CHECK (base_price > 0),
    CONSTRAINT gold_price_positive CHECK (gold_price IS NULL OR gold_price > 0),
    CONSTRAINT silver_price_positive CHECK (silver_price IS NULL OR silver_price > 0),
    CONSTRAINT stock_quantity_positive CHECK (stock_quantity >= 0)
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    
    -- Order details
    status order_status DEFAULT 'pending',
    
    -- Financial information
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    
    -- Shipping information
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_city TEXT,
    shipping_province TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT DEFAULT 'Canada',
    
    -- Dates
    order_date TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- Notes
    customer_notes TEXT,
    internal_notes TEXT,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT subtotal_positive CHECK (subtotal >= 0),
    CONSTRAINT total_positive CHECK (total_amount >= 0)
);

-- Order items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Product snapshot (at time of order)
    product_name TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    product_unit TEXT NOT NULL,
    
    -- Pricing and quantity
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT quantity_positive CHECK (quantity > 0),
    CONSTRAINT unit_price_positive CHECK (unit_price >= 0)
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    
    -- Invoice details
    status invoice_status DEFAULT 'draft',
    
    -- Financial information
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    amount_paid DECIMAL(12, 2) DEFAULT 0,
    
    -- Dates
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    
    -- Payment information
    payment_method TEXT,
    payment_reference TEXT,
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT total_positive CHECK (total_amount >= 0),
    CONSTRAINT amount_paid_positive CHECK (amount_paid >= 0),
    CONSTRAINT amount_paid_within_total CHECK (amount_paid <= total_amount)
);

-- Inventory transactions table (audit trail for stock changes)
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type TEXT NOT NULL, -- 'purchase', 'sale', 'adjustment', 'return', 'damage'
    quantity_change INTEGER NOT NULL, -- positive for additions, negative for subtractions
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    
    -- Reference
    reference_type TEXT, -- 'order', 'manual', 'return'
    reference_id UUID, -- order_id or other reference
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table (system-wide audit trail)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Activity details
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
    entity_type TEXT NOT NULL, -- 'order', 'product', 'store', etc.
    entity_id UUID,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store credit history table
CREATE TABLE store_credit_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    
    -- Credit change
    amount DECIMAL(12, 2) NOT NULL,
    balance_before DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    
    -- Reference
    transaction_type TEXT NOT NULL, -- 'order', 'payment', 'adjustment'
    reference_type TEXT,
    reference_id UUID,
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Stores indexes
CREATE INDEX idx_stores_user_id ON stores(user_id);
CREATE INDEX idx_stores_status ON stores(status);
CREATE INDEX idx_stores_tier ON stores(tier);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_email ON stores(email);

-- Products indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_stock_status ON products(stock_status);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_name ON products(name);

-- Categories indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- Orders indexes
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX idx_orders_created_by ON orders(created_by);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Invoices indexes
CREATE INDEX idx_invoices_store_id ON invoices(store_id);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Inventory transactions indexes
CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_created_at ON inventory_transactions(created_at DESC);
CREATE INDEX idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);

-- Activity logs indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Store credit history indexes
CREATE INDEX idx_store_credit_history_store_id ON store_credit_history(store_id);
CREATE INDEX idx_store_credit_history_created_at ON store_credit_history(created_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get the count of orders today
    SELECT COUNT(*) INTO counter
    FROM orders
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Generate order number: ORD-YYYYMMDD-XXXX
    new_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((counter + 1)::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get the count of invoices this month
    SELECT COUNT(*) INTO counter
    FROM invoices
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
    
    -- Generate invoice number: INV-YYYYMM-XXXX
    new_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD((counter + 1)::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to set order number
CREATE OR REPLACE FUNCTION set_order_number_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to set invoice number
CREATE OR REPLACE FUNCTION set_invoice_number_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update stock status based on quantity
CREATE OR REPLACE FUNCTION update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_quantity = 0 THEN
        NEW.stock_status := 'out_of_stock';
    ELSIF NEW.stock_quantity <= NEW.low_stock_threshold THEN
        NEW.stock_status := 'low_stock';
    ELSE
        NEW.stock_status := 'in_stock';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    order_subtotal DECIMAL(12, 2);
BEGIN
    -- Calculate subtotal from order items
    SELECT COALESCE(SUM(subtotal), 0) INTO order_subtotal
    FROM order_items
    WHERE order_id = NEW.order_id;
    
    -- Update order totals
    UPDATE orders
    SET 
        subtotal = order_subtotal,
        total_amount = order_subtotal + COALESCE(shipping_cost, 0) + COALESCE(tax_amount, 0) - COALESCE(discount_amount, 0),
        updated_at = NOW()
    WHERE id = NEW.order_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update store credit on order
CREATE OR REPLACE FUNCTION update_store_credit_on_order()
RETURNS TRIGGER AS $$
DECLARE
    store_rec RECORD;
BEGIN
    -- Only process for confirmed orders
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        -- Get current store credit info
        SELECT credit_limit, credit_used INTO store_rec
        FROM stores
        WHERE id = NEW.store_id;
        
        -- Update store credit
        UPDATE stores
        SET credit_used = credit_used + NEW.total_amount
        WHERE id = NEW.store_id;
        
        -- Log credit history
        INSERT INTO store_credit_history (
            store_id, amount, balance_before, balance_after,
            transaction_type, reference_type, reference_id, notes
        ) VALUES (
            NEW.store_id,
            NEW.total_amount,
            store_rec.credit_used,
            store_rec.credit_used + NEW.total_amount,
            'order',
            'order',
            NEW.id,
            'Credit used for order ' || NEW.order_number
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock on order
CREATE OR REPLACE FUNCTION update_product_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    product_stock INTEGER;
BEGIN
    -- Only process when order is confirmed
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        -- Loop through order items and reduce stock
        FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
            -- Get current stock
            SELECT stock_quantity INTO product_stock
            FROM products
            WHERE id = item.product_id;
            
            -- Update product stock
            UPDATE products
            SET stock_quantity = stock_quantity - item.quantity
            WHERE id = item.product_id;
            
            -- Log inventory transaction
            INSERT INTO inventory_transactions (
                product_id, transaction_type, quantity_change,
                quantity_before, quantity_after,
                reference_type, reference_id, notes
            ) VALUES (
                item.product_id,
                'sale',
                -item.quantity,
                product_stock,
                product_stock - item.quantity,
                'order',
                NEW.id,
                'Stock reduced for order ' || NEW.order_number
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
    action_type TEXT;
    user_id_val UUID;
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        action_type := 'create';
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'update';
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'delete';
    END IF;
    
    -- Try to get user_id from session or use NULL
    user_id_val := NULLIF(current_setting('app.user_id', TRUE), '')::UUID;
    
    -- Log the activity
    IF TG_OP = 'DELETE' THEN
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values)
        VALUES (user_id_val, action_type, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    ELSE
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values)
        VALUES (
            user_id_val,
            action_type,
            TG_TABLE_NAME,
            NEW.id,
            CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
            row_to_json(NEW)
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stock status trigger
CREATE TRIGGER update_product_stock_status BEFORE INSERT OR UPDATE OF stock_quantity ON products
    FOR EACH ROW EXECUTE FUNCTION update_stock_status();

-- Order number generation trigger
CREATE TRIGGER set_order_number BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION set_order_number_trigger();

-- Invoice number generation trigger
CREATE TRIGGER set_invoice_number BEFORE INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION set_invoice_number_trigger();

-- Order totals calculation trigger
CREATE TRIGGER calculate_order_totals_trigger AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION calculate_order_totals();

-- Store credit update trigger
CREATE TRIGGER update_store_credit AFTER UPDATE OF status ON orders
    FOR EACH ROW EXECUTE FUNCTION update_store_credit_on_order();

-- Product stock update trigger
CREATE TRIGGER update_product_stock AFTER UPDATE OF status ON orders
    FOR EACH ROW EXECUTE FUNCTION update_product_stock_on_order();

-- Activity logging triggers (selective tables)
CREATE TRIGGER log_order_activity AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_product_activity AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_store_activity AFTER INSERT OR UPDATE OR DELETE ON stores
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_credit_history ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Stores policies
CREATE POLICY "Retailers can view their own store" ON stores
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

CREATE POLICY "Admins can manage stores" ON stores
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- Products policies
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- Categories policies
CREATE POLICY "Anyone can view active categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- Orders policies
CREATE POLICY "Users can view their store's orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = orders.store_id 
            AND stores.user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

CREATE POLICY "Retailers can create orders for their store" ON orders
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = store_id 
            AND stores.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all orders" ON orders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- Order items policies
CREATE POLICY "Users can view items for their orders" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            JOIN stores ON stores.id = orders.store_id
            WHERE orders.id = order_items.order_id 
            AND (stores.user_id = auth.uid() OR 
                 EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')))
        )
    );

CREATE POLICY "Users can create order items for their orders" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            JOIN stores ON stores.id = orders.store_id
            WHERE orders.id = order_id 
            AND stores.user_id = auth.uid()
        )
    );

-- Invoices policies
CREATE POLICY "Users can view their store's invoices" ON invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = invoices.store_id 
            AND stores.user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

CREATE POLICY "Admins can manage invoices" ON invoices
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- Inventory transactions policies
CREATE POLICY "Admins can view inventory transactions" ON inventory_transactions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- Activity logs policies
CREATE POLICY "Admins can view activity logs" ON activity_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Store credit history policies
CREATE POLICY "Users can view their store's credit history" ON store_credit_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = store_credit_history.store_id 
            AND stores.user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    );

-- =====================================================
-- VIEWS (for easier querying)
-- =====================================================

-- View for product catalog with category info
CREATE VIEW product_catalog AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;

-- View for order summary
CREATE VIEW order_summary AS
SELECT 
    o.*,
    s.name as store_name,
    s.tier as store_tier,
    COUNT(oi.id) as item_count,
    u.full_name as created_by_name
FROM orders o
JOIN stores s ON o.store_id = s.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN users u ON o.created_by = u.id
GROUP BY o.id, s.name, s.tier, u.full_name;

-- View for low stock products
CREATE VIEW low_stock_products AS
SELECT 
    p.*,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.stock_quantity <= p.low_stock_threshold
AND p.is_active = true
ORDER BY p.stock_quantity ASC;

-- View for store credit summary
CREATE VIEW store_credit_summary AS
SELECT 
    s.id,
    s.name,
    s.tier,
    s.credit_limit,
    s.credit_used,
    s.credit_limit - s.credit_used as credit_available,
    ROUND((s.credit_used / NULLIF(s.credit_limit, 0) * 100), 2) as credit_utilization_percent
FROM stores s
WHERE s.status = 'active';

-- =====================================================
-- INITIAL DATA / SEED DATA
-- =====================================================

-- Insert default categories
INSERT INTO categories (name, description, slug, sort_order) VALUES
('Dairy', 'Dairy products including paneer, cheese, milk', 'dairy', 1),
('Snacks', 'Snacks and appetizers', 'snacks', 2),
('Grains', 'Rice, wheat, and other grains', 'grains', 3),
('Breads', 'Naan, roti, and other breads', 'breads', 4),
('Beverages', 'Drinks and beverage mixes', 'beverages', 5);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON orders, order_items TO authenticated;
GRANT INSERT ON activity_logs TO authenticated;

-- Grant permissions to service role (for admin operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
