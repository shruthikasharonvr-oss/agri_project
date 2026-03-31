-- Seed Script: Add 12 Marketplace Products
-- Run this in Supabase SQL Editor to populate the marketplace

-- First, delete any existing products (optional - comment out if you want to keep existing)
-- DELETE FROM products;

-- Insert the 12 marketplace products
INSERT INTO products (name, category, price, unit, rating, image_url, farmer_id, created_at)
VALUES
  ('Organic Ragi Flour', 'Grains', 60, 'kg', 4.8, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKlkLRUmc3NuhvhdVOuCQLqcG4yo14oSE6vg&s', NULL, NOW()),
  ('Fresh Cow Ghee', 'Dairy', 850, '500ml', 4.9, 'https://images.unsplash.com/photo-1596522868827-678785f7cd45?q=80&w=2000&auto=format&fit=crop', NULL, NOW()),
  ('Pure Wild Honey', 'Honey', 450, 'kg', 5.0, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMm2fiyXRMp1b6Qs7ChWvnsyCJKki-2SoaJg&s', NULL, NOW()),
  ('Premium Basmati Rice', 'Grains', 320, 'kg', 4.7, 'https://images.unsplash.com/photo-1586080876198-6e2ce93ef6ba?q=80&w=2000&auto=format&fit=crop', NULL, NOW()),
  ('Fresh Tomatoes', 'Vegetables', 45, 'kg', 4.6, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=2000&auto=format&fit=crop', NULL, NOW()),
  ('Banana Bunch', 'Fruits', 80, 'dozen', 4.8, 'https://images.unsplash.com/photo-1587182142653-2f31e908e1b4?q=80&w=2000&auto=format&fit=crop', NULL, NOW()),
  ('Organic Spinach', 'Vegetables', 35, 'kg', 4.9, 'https://m.media-amazon.com/images/I/6190UDgSyIL._AC_UF1000,1000_QL80_.jpg', NULL, NOW()),
  ('Alphonso Mangoes', 'Fruits', 1200, 'dozen', 4.7, 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1580&auto=format&fit=crop', NULL, NOW()),
  ('Turmeric Powder', 'Spices', 250, 'kg', 4.9, 'https://images.unsplash.com/photo-1596040306246-1c2ca6b08bbb?q=80&w=2000&auto=format&fit=crop', NULL, NOW()),
  ('Coconut Oil', 'Oils', 320, 'ltr', 4.8, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4B02KYH5EVtUMaXrqSJcXzNi0hjJwYoDR9A&s', NULL, NOW()),
  ('Fresh Carrot', 'Vegetables', 40, 'kg', 4.7, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=2000&auto=format&fit=crop', NULL, NOW()),
  ('Pearl Millet', 'Grains', 120, 'kg', 4.8, 'https://images.unsplash.com/photo-1586254965502-e96da69f04da?q=80&w=2000&auto=format&fit=crop', NULL, NOW());

-- Verify insertion
SELECT COUNT(*) as total_products FROM products;
SELECT name, category, price, unit FROM products ORDER BY created_at DESC LIMIT 12;
