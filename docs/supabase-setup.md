# Supabase Setup

This project can now use Supabase as the source of truth for:

- products
- inventory quantities
- order history
- order items

Auth is still intentionally out of scope.

## 1. Create a Supabase project

- Create a new Supabase project
- Copy the project URL
- Copy the service role key from project settings

Add these to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 2. Create the tables

In the Supabase SQL editor, run:

- [supabase/schema.sql](/Users/lucianomenezes/Documents/GitHub/OneMoreGood/supabase/schema.sql)

This creates:

- `products`
- `orders`
- `order_items`

## 3. Seed products into Supabase

After the schema exists and your env vars are set, start the app and call:

```bash
curl -X POST http://localhost:3000/api/stock/init
```

That route upserts the current catalog from:

- [data/products.ts](/Users/lucianomenezes/Documents/GitHub/OneMoreGood/data/products.ts)

into the `products` table.

## 4. How the app behaves after Supabase is configured

- `/api/products` reads products from Supabase
- `/api/stock` reads inventory from Supabase
- checkout validates inventory against Supabase
- successful Stripe webhook writes the order into Supabase
- successful Stripe webhook writes `order_items` rows
- successful Stripe webhook decrements `products.inventory_quantity`

## 5. What to edit after setup

Inventory and product data should be edited in Supabase:

- `products.title`
- `products.price`
- `products.image`
- `products.description`
- `products.tags`
- `products.inventory_quantity`
- `products.is_active`

The static file remains useful as a seed/fallback, but Supabase becomes the operational source of truth once configured.
