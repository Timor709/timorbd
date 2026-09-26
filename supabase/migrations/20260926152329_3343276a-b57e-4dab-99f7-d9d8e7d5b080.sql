create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  price integer not null check (price >= 0),
  compare_at integer,
  description text not null default '',
  image_url text not null default '',
  collection text not null default 'Essential',
  in_stock boolean not null default true,
  stock integer not null default 0,
  straps text[] not null default '{}',
  sizes text[] not null default '{}',
  specs jsonb not null default '[]',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

grant select on public.products to anon;
grant select on public.products to authenticated;
grant all on public.products to service_role;

alter table public.products enable row level security;

create policy "Anyone can view products"
  on public.products for select
  to anon, authenticated
  using (true);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null unique,
  customer_name text not null,
  phone text not null,
  address text not null,
  note text,
  payment_method text not null default 'cod' check (payment_method in ('cod', 'online')),
  items jsonb not null default '[]',
  subtotal integer not null default 0,
  delivery_fee integer not null default 0,
  total integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

grant insert on public.orders to anon;
grant select, insert on public.orders to authenticated;
grant all on public.orders to service_role;

alter table public.orders enable row level security;

create policy "Anyone can place an order"
  on public.orders for insert
  to anon, authenticated
  with check (true);

insert into public.products (slug, name, tagline, price, compare_at, description, image_url, collection, in_stock, stock, straps, sizes, specs, featured) values
('meridian-noir', 'Meridian Noir', 'Blackened steel chronograph', 24500, 28900,
 'A stealth chronograph finished in matte blackened steel with a skeletonised movement. Built for those who prefer presence over noise.',
 'watch-3.jpg', 'Noir', true, 12,
 array['Black Steel', 'Black Leather', 'Rubber'], array['40 mm', '42 mm', '44 mm'],
 '[{"label":"Movement","value":"Automatic, 42h reserve"},{"label":"Case","value":"316L blackened steel"},{"label":"Glass","value":"Sapphire, anti-reflective"},{"label":"Water resistance","value":"10 ATM"}]'::jsonb, true),
('abyss-diver', 'Abyss Diver', 'Deep blue dive automatic', 19900, null,
 'A 200 m dive automatic with a sunburst blue dial, unidirectional bezel and luminous markers legible at depth.',
 'watch-1.jpg', 'Marine', true, 8,
 array['Steel Bracelet', 'Navy Rubber'], array['40 mm', '42 mm'],
 '[{"label":"Movement","value":"Automatic, 40h reserve"},{"label":"Case","value":"Brushed stainless steel"},{"label":"Glass","value":"Domed sapphire"},{"label":"Water resistance","value":"20 ATM"}]'::jsonb, true),
('heritage-gold', 'Heritage Gold', 'Gold-cased dress watch', 32900, null,
 'A slim dress piece with a champagne dial and hand-stitched leather strap. Quiet formality, made to be inherited.',
 'watch-2.jpg', 'Heritage', true, 5,
 array['Brown Leather', 'Black Leather'], array['38 mm', '40 mm'],
 '[{"label":"Movement","value":"Hand-wound, 45h reserve"},{"label":"Case","value":"Gold-plated steel, 8.2 mm"},{"label":"Glass","value":"Sapphire"},{"label":"Water resistance","value":"5 ATM"}]'::jsonb, true),
('pure-minimal', 'Pure Minimal', 'White dial, mesh bracelet', 14900, 17500,
 'Reduced to the essentials: a clean white dial, needle hands and a milanese mesh bracelet that disappears on the wrist.',
 'watch-4.jpg', 'Essential', true, 20,
 array['Steel Mesh', 'Tan Leather'], array['36 mm', '39 mm'],
 '[{"label":"Movement","value":"Swiss quartz"},{"label":"Case","value":"Polished steel, 7.4 mm"},{"label":"Glass","value":"Sapphire"},{"label":"Water resistance","value":"3 ATM"}]'::jsonb, false),
('ember-rose', 'Ember Rose', 'Rose gold chronograph', 27500, null,
 'Rose gold case against a deep black dial with three counters. Warmth and contrast in equal measure.',
 'watch-5.jpg', 'Noir', true, 7,
 array['Rose Gold Bracelet', 'Black Leather'], array['40 mm', '42 mm'],
 '[{"label":"Movement","value":"Automatic chronograph"},{"label":"Case","value":"Rose gold PVD steel"},{"label":"Glass","value":"Sapphire"},{"label":"Water resistance","value":"10 ATM"}]'::jsonb, false),
('altitude-field', 'Altitude Field', 'Titanium field automatic', 21900, null,
 'A lightweight titanium field watch with a forest green dial and full lume indices. Made for long distances.',
 'watch-6.jpg', 'Marine', false, 0,
 array['Titanium Bracelet', 'Green NATO'], array['39 mm', '41 mm'],
 '[{"label":"Movement","value":"Automatic, 50h reserve"},{"label":"Case","value":"Grade 5 titanium"},{"label":"Glass","value":"Sapphire"},{"label":"Water resistance","value":"10 ATM"}]'::jsonb, false);