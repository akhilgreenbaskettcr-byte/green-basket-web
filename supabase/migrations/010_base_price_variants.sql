-- ============================================================
-- GREEN BASKET — Base Price & Dynamic Unit Variants Migration
-- ============================================================

-- 1. Add base_price, unit_type, compare_base_price to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS base_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  ADD COLUMN IF NOT EXISTS unit_type TEXT NOT NULL DEFAULT 'kg' CHECK (unit_type IN ('kg', 'litre', 'piece', 'pack')),
  ADD COLUMN IF NOT EXISTS compare_base_price NUMERIC(10,2) CHECK (compare_base_price >= 0);

-- 2. Add quantity_value, is_auto_priced to product_variants
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS quantity_value NUMERIC(10,3) NOT NULL DEFAULT 1 CHECK (quantity_value > 0),
  ADD COLUMN IF NOT EXISTS is_auto_priced BOOLEAN NOT NULL DEFAULT true;

-- 3. Backfill/Inference for existing data:
-- Parse common labels (e.g. 250g, 500g, 1kg, 100ml, 500ml, 1L, 1pc, etc.)
UPDATE public.product_variants
SET quantity_value = CASE
  -- Grams -> kg
  WHEN LOWER(label) LIKE '%100g%' THEN 0.100
  WHEN LOWER(label) LIKE '%200g%' THEN 0.200
  WHEN LOWER(label) LIKE '%250g%' THEN 0.250
  WHEN LOWER(label) LIKE '%400g%' THEN 0.400
  WHEN LOWER(label) LIKE '%500g%' THEN 0.500
  WHEN LOWER(label) LIKE '%750g%' THEN 0.750
  WHEN LOWER(label) LIKE '%1kg%' OR LOWER(label) LIKE '%1 kg%' THEN 1.000
  WHEN LOWER(label) LIKE '%2kg%' OR LOWER(label) LIKE '%2 kg%' THEN 2.000
  WHEN LOWER(label) LIKE '%5kg%' OR LOWER(label) LIKE '%5 kg%' THEN 5.000
  -- Millilitres -> litre
  WHEN LOWER(label) LIKE '%100ml%' THEN 0.100
  WHEN LOWER(label) LIKE '%200ml%' THEN 0.200
  WHEN LOWER(label) LIKE '%250ml%' THEN 0.250
  WHEN LOWER(label) LIKE '%500ml%' THEN 0.500
  WHEN LOWER(label) LIKE '%750ml%' THEN 0.750
  WHEN LOWER(label) LIKE '%1l%' OR LOWER(label) LIKE '%1 l%' OR LOWER(label) LIKE '%1 litre%' OR LOWER(label) LIKE '%1liter%' THEN 1.000
  WHEN LOWER(label) LIKE '%2l%' OR LOWER(label) LIKE '%2 l%' OR LOWER(label) LIKE '%2 litre%' THEN 2.000
  WHEN LOWER(label) LIKE '%5l%' OR LOWER(label) LIKE '%5 l%' OR LOWER(label) LIKE '%5 litre%' THEN 5.000
  -- Pieces / default
  WHEN LOWER(label) LIKE '%1 pc%' OR LOWER(label) LIKE '%1pc%' OR LOWER(label) LIKE '%1 piece%' THEN 1.000
  WHEN LOWER(label) LIKE '%2 pc%' OR LOWER(label) LIKE '%2pc%' OR LOWER(label) LIKE '%2 piece%' THEN 2.000
  WHEN LOWER(label) LIKE '%4 pc%' OR LOWER(label) LIKE '%4pc%' OR LOWER(label) LIKE '%4 piece%' THEN 4.000
  WHEN LOWER(label) LIKE '%6 pc%' OR LOWER(label) LIKE '%6pc%' OR LOWER(label) LIKE '%6 piece%' THEN 6.000
  WHEN LOWER(label) LIKE '%12 pc%' OR LOWER(label) LIKE '%12pc%' OR LOWER(label) LIKE '%12 piece%' THEN 12.000
  ELSE 1.000
END;

-- Infer unit_type for products based on category / variant labels
UPDATE public.products p
SET unit_type = 'litre'
WHERE EXISTS (
  SELECT 1 FROM public.product_variants pv 
  WHERE pv.product_id = p.id 
  AND (LOWER(pv.label) LIKE '%ml%' OR LOWER(pv.label) LIKE '%litre%' OR LOWER(pv.label) LIKE '%liter%' OR LOWER(pv.label) LIKE '%1l%')
) OR LOWER(p.name) LIKE '%oil%' OR LOWER(p.name) LIKE '%ghee%' OR LOWER(p.name) LIKE '%juice%' OR LOWER(p.name) LIKE '%milk%';

-- Infer base_price for existing products based on the 1 unit variant, or scaled from smallest/largest variant
WITH calculated_base AS (
  SELECT DISTINCT ON (product_id)
    product_id,
    ROUND((price / NULLIF(quantity_value, 0))::NUMERIC, 2) AS calculated_base_price
  FROM public.product_variants
  WHERE price > 0
  ORDER BY product_id, (CASE WHEN quantity_value = 1 THEN 0 ELSE 1 END), sort_order
)
UPDATE public.products p
SET base_price = cb.calculated_base_price
FROM calculated_base cb
WHERE p.id = cb.product_id AND p.base_price = 0;
