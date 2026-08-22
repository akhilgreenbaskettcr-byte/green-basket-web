-- ============================================================
-- GREEN BASKET — Seed Data
-- ============================================================

-- ============================================================
-- SITE SETTINGS
-- ============================================================
insert into public.site_settings (key, value) values
  ('brand_name',              'Green Basket'),
  ('tagline',                 'Your Kitchen, Simplified'),
  ('contact_phone',           '+91 98765 43210'),
  ('contact_email',           'hello@greenbasket.in'),
  ('contact_address',         'Ernakulam, Kerala, India'),
  ('delivery_message',        'Freshly cut. Hygienically packed. Delivered to your doorstep.'),
  ('same_day_cutoff_time',    '1:00 PM'),
  ('same_day_message',        'Order before 1PM for same day delivery.'),
  ('delivery_fee',            '40'),
  ('free_delivery_above',     '500'),
  ('instagram_url',           'https://instagram.com/greenbasketin'),
  ('facebook_url',            'https://facebook.com/greenbasketin'),
  ('whatsapp_number',         '+919876543210'),
  ('footer_tagline',          'From freshly cut vegetables to aromatic powders and pure oils — everything your kitchen needs, made easy.'),
  ('hero_image_url',          'https://res.cloudinary.com/pjgmmeb8/image/upload/v1787394877/green-basket/hero/hero_vegetables_main.jpg'),
  ('hero_headline_line1',     'Fresh ingredients.'),
  ('hero_headline_line2',     'Made simple.'),
  ('hero_description',        'From freshly cut vegetables to aromatic powders and pure oils — everything your kitchen needs, made easy.')
on conflict (key) do update set value = excluded.value;

-- ============================================================
-- CATEGORIES
-- ============================================================
insert into public.categories (id, name, slug, description, sort_order, is_active) values
  ('11111111-1111-1111-1111-111111111101', 'Vegetables Cuts',  'vegetables-cuts',  'Fresh & ready to cook. Hygienically cut and packed vegetables for your daily cooking.', 1, true),
  ('11111111-1111-1111-1111-111111111102', 'Fruits Cuts',      'fruits-cuts',      'Healthy & delicious. Fresh seasonal fruits, cleaned and cut for your convenience.', 2, true),
  ('11111111-1111-1111-1111-111111111103', 'Curry Powders',    'curry-powders',    'Rich aroma & flavor. Pure, freshly ground curry powders made from premium spices.', 3, true),
  ('11111111-1111-1111-1111-111111111104', 'Masala Powders',   'masala-powders',   'Perfectly blended. Authentic masala powders crafted from traditional Kerala recipes.', 4, true),
  ('11111111-1111-1111-1111-111111111105', 'Chutney Powders',  'chutney-powders',  'Traditional taste. Ready-to-use chutney powders for quick and delicious accompaniments.', 5, true),
  ('11111111-1111-1111-1111-111111111106', 'Oils',             'oils',             'Pure & natural. Cold-pressed and traditionally extracted oils for a healthy kitchen.', 6, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- ============================================================
-- PRODUCTS — Vegetables Cuts
-- ============================================================
insert into public.products (id, category_id, name, slug, description, is_active, is_featured, sort_order) values
  ('22222222-2222-2222-2222-222222222201',
   '11111111-1111-1111-1111-111111111101',
   'Sambar Cut',
   'sambar-cut',
   'A perfectly portioned mix of vegetables cut and ready for your sambar — includes drumstick, pumpkin, carrot, beans, and brinjal. Freshly cut and hygienically packed on the day of delivery.',
   true, true, 1),
  ('22222222-2222-2222-2222-222222222202',
   '11111111-1111-1111-1111-111111111101',
   'Aviyal Cut',
   'aviyal-cut',
   'Traditional Kerala aviyal vegetable mix — raw banana, elephant yam, carrot, drumstick, and raw mango. Cleaned, peeled, and cut to the right size for authentic aviyal.',
   true, false, 2),
  ('22222222-2222-2222-2222-222222222203',
   '11111111-1111-1111-1111-111111111101',
   'Grated Coconut',
   'grated-coconut',
   'Freshly grated coconut from selected Kerala coconuts. Hygienically packed and ready to use in curries, chutneys, and traditional dishes.',
   true, false, 3)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_featured = excluded.is_featured;

-- ============================================================
-- PRODUCTS — Fruits Cuts
-- ============================================================
insert into public.products (id, category_id, name, slug, description, is_active, is_featured, sort_order) values
  ('22222222-2222-2222-2222-222222222204',
   '11111111-1111-1111-1111-111111111102',
   'Mix Fruits Cut',
   'mix-fruits-cut',
   'A colourful assortment of fresh seasonal fruits, carefully selected, washed, and cut — ideal for fruit bowls, salads, and healthy snacking.',
   true, true, 1),
  ('22222222-2222-2222-2222-222222222205',
   '11111111-1111-1111-1111-111111111102',
   'Seasonal Mix Fruits Cut',
   'seasonal-mix-fruits-cut',
   'Locally sourced seasonal fruits cut fresh each morning. The mix changes based on Kerala''s seasonal produce — always fresh, always delicious.',
   true, false, 2)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description;

-- ============================================================
-- PRODUCTS — Curry Powders
-- ============================================================
insert into public.products (id, category_id, name, slug, description, is_active, is_featured, sort_order, benefits, storage_info) values
  ('22222222-2222-2222-2222-222222222206',
   '11111111-1111-1111-1111-111111111103',
   'Chilly Powder',
   'chilly-powder',
   'Pure, sun-dried and freshly ground red chilly powder made from premium Kashmiri and local Kerala chillies. Bright colour, bold heat, and no artificial additives.',
   true, true, 1,
   'Rich in antioxidants. No artificial colours or preservatives. Made from premium red chillies.',
   'Store in a cool, dry place. Keep container tightly closed. Best used within 6 months of purchase.'),
  ('22222222-2222-2222-2222-222222222207',
   '11111111-1111-1111-1111-111111111103',
   'Coriander Powder',
   'coriander-powder',
   'Freshly roasted and ground coriander seeds. Mild, earthy, and aromatic — an essential base for every Kerala curry. No fillers, no artificial flavours.',
   true, false, 2,
   'Rich in dietary fibre and iron. No artificial additives. Freshly ground for maximum aroma.',
   'Store in an airtight container away from direct sunlight. Best used within 6 months.'),
  ('22222222-2222-2222-2222-222222222208',
   '11111111-1111-1111-1111-111111111103',
   'Turmeric Powder',
   'turmeric-powder',
   'Pure, naturally vibrant turmeric powder sourced directly from Kerala turmeric farms. No artificial colour, no preservatives — just pure earthy goodness.',
   true, false, 3,
   'High curcumin content. Anti-inflammatory. No additives. Traditionally sourced from Kerala farms.',
   'Store in a cool, dry, airtight container. Keep away from moisture and direct light.')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_featured = excluded.is_featured;

-- ============================================================
-- PRODUCTS — Masala Powders
-- ============================================================
insert into public.products (id, category_id, name, slug, description, is_active, is_featured, sort_order, storage_info) values
  ('22222222-2222-2222-2222-222222222209',
   '11111111-1111-1111-1111-111111111104',
   'Garam Masala',
   'garam-masala',
   'A warming, aromatic blend of whole spices — cinnamon, cloves, cardamom, pepper, and star anise. Ground fresh in small batches for maximum fragrance.',
   true, true, 1,
   'Store in an airtight container in a cool, dry place. Best used within 4 months of purchase.'),
  ('22222222-2222-2222-2222-222222222210',
   '11111111-1111-1111-1111-111111111104',
   'Chicken Curry Powder',
   'chicken-curry-powder',
   'A perfectly balanced spice blend crafted specifically for Kerala-style chicken curries. Deep, smoky, and richly flavoured with traditional whole spices.',
   true, true, 2,
   'Store in a cool, dry, airtight container. Use within 4 months for best flavour.'),
  ('22222222-2222-2222-2222-222222222211',
   '11111111-1111-1111-1111-111111111104',
   'Garam Masala Whole',
   'garam-masala-whole',
   'Premium whole garam masala spices — ideal for tempering in oil at the start of cooking. Includes cardamom, cloves, cinnamon sticks, bay leaves, and star anise.',
   true, false, 3,
   'Store in an airtight container away from moisture. Whole spices retain freshness for up to 12 months.')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_featured = excluded.is_featured;

-- ============================================================
-- PRODUCTS — Chutney Powders
-- ============================================================
insert into public.products (id, category_id, name, slug, description, is_active, is_featured, sort_order) values
  ('22222222-2222-2222-2222-222222222212',
   '11111111-1111-1111-1111-111111111105',
   'Dal Chutney Powder',
   'dal-chutney-powder',
   'A classic South Indian chutney powder made with roasted lentils, dried red chillies, and curry leaves. Perfect with dosa, idly, or plain rice and ghee.',
   true, false, 1),
  ('22222222-2222-2222-2222-222222222213',
   '11111111-1111-1111-1111-111111111105',
   'Idly Dosa Chutney Powder',
   'idly-dosa-chutney-powder',
   'A versatile, mildly spiced chutney powder that pairs beautifully with idly and dosa. Made from a traditional recipe with roasted chana dal, urad dal, and sesame.',
   true, true, 2),
  ('22222222-2222-2222-2222-222222222214',
   '11111111-1111-1111-1111-111111111105',
   'Thengai Chutney Powder',
   'thengai-chutney-powder',
   'A fragrant coconut chutney powder made with roasted coconut, chillies, and curry leaves. Recreates the taste of fresh coconut chutney in a convenient dry form.',
   true, false, 3),
  ('22222222-2222-2222-2222-222222222215',
   '11111111-1111-1111-1111-111111111105',
   'Peanut Chutney Powder',
   'peanut-chutney-powder',
   'A nutty, slightly spicy chutney powder made from roasted peanuts and red chillies. Rich in protein and full of flavour — great with rice or as a dip with snacks.',
   true, false, 4)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description;

-- ============================================================
-- PRODUCTS — Oils
-- ============================================================
insert into public.products (id, category_id, name, slug, description, is_active, is_featured, sort_order, benefits, storage_info) values
  ('22222222-2222-2222-2222-222222222216',
   '11111111-1111-1111-1111-111111111106',
   'Coconut Oil',
   'coconut-oil',
   'Pure, cold-pressed coconut oil extracted from fresh Kerala coconuts. Unrefined and naturally fragrant — ideal for cooking, tempering, and hair care.',
   true, true, 1,
   'Rich in lauric acid and medium-chain fatty acids. No hydrogenation. No chemical processing. Traditionally extracted.',
   'Store in a cool, dry place away from direct sunlight. May solidify in cooler temperatures — this is natural. Gently warm to reliquify.')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  is_featured = excluded.is_featured;

-- ============================================================
-- PRODUCT VARIANTS — Sambar Cut
-- ============================================================
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222201', '500g', 45.00, 'VEG-SC-500', 50, true, 1)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Aviyal Cut
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222202', '500g', 50.00, 'VEG-AC-500', 40, true, 1)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Grated Coconut
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222203', '250g', 35.00, 'VEG-GC-250', 60, true, 1)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Mix Fruits Cut
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222204', '250g', 60.00, 'FRT-MF-250', 30, true, 1)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Seasonal Mix Fruits Cut
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222205', '250g', 65.00, 'FRT-SF-250', 25, true, 1)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Chilly Powder
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222206', '500g', 120.00, 'CP-500', 100, true, 1),
  ('22222222-2222-2222-2222-222222222206', '1kg',  220.00, 'CP-1KG', 80,  true, 2)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Coriander Powder
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222207', '500g', 90.00,  'COP-500', 100, true, 1),
  ('22222222-2222-2222-2222-222222222207', '1kg',  170.00, 'COP-1KG', 70,  true, 2)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Turmeric Powder
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222208', '500g', 80.00, 'TP-500', 90, true, 1)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Garam Masala
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222209', '250g', 95.00,  'GM-250', 60, true, 1),
  ('22222222-2222-2222-2222-222222222209', '500g', 175.00, 'GM-500', 50, true, 2)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Chicken Curry Powder
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222210', '250g', 110.00, 'CCP-250', 55, true, 1),
  ('22222222-2222-2222-2222-222222222210', '500g', 200.00, 'CCP-500', 45, true, 2)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Garam Masala Whole
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222211', '500g', 150.00, 'GMW-500', 40, true, 1)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Dal Chutney Powder
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222212', '100g', 55.00, 'DCP-100', 70, true, 1)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Idly Dosa Chutney Powder
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222213', '100g', 55.00, 'IDP-100', 65, true, 1)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Thengai Chutney Powder
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222214', '100g', 60.00, 'TCP-100', 60, true, 1)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Peanut Chutney Powder
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222215', '100g', 50.00, 'PCP-100', 75, true, 1)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;

-- Coconut Oil
insert into public.product_variants (product_id, label, price, sku, stock_quantity, is_available, sort_order) values
  ('22222222-2222-2222-2222-222222222216', '500ml', 185.00, 'OIL-CO-500', 80, true, 1),
  ('22222222-2222-2222-2222-222222222216', '1L',    340.00, 'OIL-CO-1L',  60, true, 2)
on conflict (sku) do update set price = excluded.price, stock_quantity = excluded.stock_quantity;
