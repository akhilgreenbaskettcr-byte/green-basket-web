-- Migration: 011_category_gst.sql
-- Description: Add category-level GST support and order snapshots for tax calculation

-- 1. Add GST fields to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS gst_enabled BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS gst_percentage NUMERIC(5,2) DEFAULT 0 NOT NULL;

-- 2. Add gst_total to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS gst_total NUMERIC(10,2) DEFAULT 0 NOT NULL;

-- 3. Add GST snapshot fields to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS gst_percentage_snapshot NUMERIC(5,2) DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(10,2) DEFAULT 0 NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN categories.gst_enabled IS 'Whether GST is applicable for items in this category';
COMMENT ON COLUMN categories.gst_percentage IS 'GST percentage rate applicable for this category (e.g., 5.00, 12.00, 18.00)';
COMMENT ON COLUMN orders.gst_total IS 'Total GST amount calculated for the order';
COMMENT ON COLUMN order_items.gst_percentage_snapshot IS 'Snapshot of category GST percentage at time of order creation';
COMMENT ON COLUMN order_items.gst_amount IS 'Calculated GST amount for this line item';
