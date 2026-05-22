# Supabase Setup

This project can now use Supabase as the source of truth for:

- products
- product image storage
- U.S. and Brazil inventory quantities
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
SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
```

If you use the default bucket name `product-images`, the last line is optional.

## 2. Create the tables

In the Supabase SQL editor, run:

- [supabase/schema.sql](/Users/lucianomenezes/Documents/GitHub/OneMoreGood/supabase/schema.sql)

This creates:

- `products`
- `orders`
- `order_items`

## 3. Create the Storage bucket

In Supabase Storage:

- Create a bucket named `product-images`
- Mark it as `Public`

If you want a different bucket name, set `SUPABASE_PRODUCT_IMAGES_BUCKET` in `.env.local` to match.

## 4. Seed products into Supabase

After the schema exists and your env vars are set, start the app and call:

```bash
curl -X POST http://localhost:3000/api/stock/init
```

That route upserts the current catalog from:

- [data/products.ts](/Users/lucianomenezes/Documents/GitHub/OneMoreGood/data/products.ts)

into the `products` table, but only for products that are still missing there.

## 5. Migrate the existing local product images into Storage

If your current `products.image` values still point to `/products/...`, run:

```bash
node --env-file=.env.local scripts/migrate-product-images-to-supabase.mjs
```

That uploads the current files from `public/products` into your Supabase Storage bucket and updates the `products.image` column to the public Storage URLs.

## 6. Restart Next.js after env changes

Because `next/image` needs the Supabase host in `next.config.ts`, restart the dev server after adding or changing the Supabase env vars.

## 7. How the app behaves after Supabase is configured

- `/api/products` reads products from Supabase
- `/api/stock` reads country-specific inventory from Supabase
- checkout validates inventory against Supabase
- successful Stripe webhook writes the order into Supabase
- successful Stripe webhook writes `order_items` rows
- successful Stripe webhook decrements the matching country inventory field

## 8. What to edit after setup

Product data should be edited from the admin dashboard:

- Go to `/admin/catalog`
- Add new items
- Upload/replace product images
- Edit title, price, description, tags, stock, sort order, and visibility
- Remove products from the shop

Inventory can still be adjusted from `/admin/stock` for faster stock-only updates.

The static file remains useful as a one-time seed/fallback, but Supabase becomes the operational source of truth once configured.
