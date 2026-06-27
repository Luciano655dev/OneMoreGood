create table if not exists public.products (
  id text primary key,
  title text not null,
  price numeric(10,2) not null,
  image text not null,
  description text,
  tags text[] not null default '{}',
  inventory_quantity integer not null default 0,
  inventory_quantity_us integer not null default 0,
  inventory_quantity_br integer not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
add column if not exists inventory_quantity_us integer not null default 0;

alter table public.products
add column if not exists inventory_quantity_br integer not null default 0;

-- Optional per-product Brazil price (reais). Null falls back to the flat BR price.
alter table public.products
add column if not exists price_br numeric(10,2);

-- Featured products are pinned to the top of the shop and highlighted.
alter table public.products
add column if not exists featured boolean not null default false;

update public.products
set
  inventory_quantity_us = coalesce(inventory_quantity_us, inventory_quantity, 0),
  inventory_quantity_br = coalesce(inventory_quantity_br, inventory_quantity, 0)
where inventory_quantity_us is null
   or inventory_quantity_br is null
   or (inventory_quantity_us = 0 and inventory_quantity_br = 0 and inventory_quantity <> 0);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  customer_email text not null,
  status text not null default 'paid',
  currency text not null default 'usd' check (currency in ('usd', 'brl')),
  subtotal_cents integer not null default 0,
  promo_savings_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null default 0,
  shipping_name text,
  shipping_address jsonb,
  tracking_number text,
  tracking_carrier text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  title text not null,
  quantity integer not null,
  unit_price_cents integer not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

alter table public.orders
add column if not exists currency text;

update public.orders
set currency = 'usd'
where currency is null or btrim(currency) = '';

alter table public.orders
alter column currency set default 'usd';

alter table public.orders
alter column currency set not null;

alter table public.orders
drop constraint if exists orders_currency_check;

alter table public.orders
add constraint orders_currency_check
check (currency in ('usd', 'brl'));

-- Brazil custom checkout + Correios (Melhor Envio) shipping labels
alter table public.orders
add column if not exists shipping_phone text;

alter table public.orders
add column if not exists shipping_service text;

alter table public.orders
add column if not exists shipping_label_url text;

alter table public.orders
add column if not exists melhor_envio_order_id text;

alter table public.orders
add column if not exists label_status text;
