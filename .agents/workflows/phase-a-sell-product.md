---
description: Phase A - Sell Product page and Marketplace integration
---

## Overview
Implements the **Sell Product** feature and ensures the **Marketplace** page displays newly added products in real‑time.

## Steps
1. **Create Sell Product Page** (`app/sell-product/page.tsx`).
   - Form fields: Product Name, Price, Unit, Category, Image URL (optional).
   - Inserts into Supabase `products` table.
   - Redirects to `/market-place` after success.
   - Uses the premium green design with rounded corners and micro‑animations.
2. **Marketplace Page** already reads from `products`; the new product appears automatically.
3. (Optional) Add a Navbar link to `/sell-product`.
4. **Testing**: Run dev server, submit form, verify product appears on Marketplace.
5. **Logging**: Errors are logged to the server console for audit.

## Checklist
- [ ] Supabase `products` table has columns `name`, `price`, `unit`, `category`, `image_url`, `farmer_id` (nullable).
- [ ] Protect the page with auth if needed.
- [ ] Add Navbar navigation.

## Commands (Turbo‑enabled)
```bash
npm run dev
```
