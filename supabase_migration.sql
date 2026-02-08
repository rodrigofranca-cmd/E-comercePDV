-- Create Tables

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  barcode TEXT NOT NULL,
  name TEXT NOT NULL,
  purchase_price NUMERIC NOT NULL,
  profit_margin NUMERIC NOT NULL,
  sale_price1 NUMERIC NOT NULL,
  sale_price2 NUMERIC,
  stock INTEGER NOT NULL,
  validity DATE,
  image TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id),
  is_offer BOOLEAN DEFAULT FALSE,
  offer_price NUMERIC,
  min_offer_qty INTEGER
);

CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT NOT NULL,
  cpf TEXT NOT NULL,
  limit_value NUMERIC NOT NULL, -- 'limit' is reserved keyword
  debt NUMERIC DEFAULT 0,
  photo TEXT
);

CREATE TABLE IF NOT EXISTS public.employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  birth_date DATE NOT NULL,
  cpf TEXT NOT NULL,
  role TEXT NOT NULL,
  photo TEXT,
  password TEXT -- Storing plain password as in original app (demo purpose)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES public.clients(id),
  client_name TEXT NOT NULL,
  client_whatsapp TEXT NOT NULL,
  address TEXT NOT NULL,
  total NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  product_name TEXT NOT NULL
);

-- Enable RLS (Row Level Security) - Optional for now but good practice
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public Read/Write for demo simplicity, similar to current local state)
CREATE POLICY "Public Access" ON public.categories FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.products FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.clients FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.employees FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.orders FOR ALL USING (true);
CREATE POLICY "Public Access" ON public.order_items FOR ALL USING (true);

-- Seed Data (Initial Constants)
INSERT INTO public.categories (id, name, image) VALUES
('1', 'Frutas', 'https://cdn-icons-png.freepik.com/512/11111/11111276.png?ga=GA1.1.384170038.1770424620'),
('2', 'Carnes', 'https://cdn-icons-png.freepik.com/512/14859/14859394.png?ga=GA1.1.384170038.1770424620'),
('3', 'Mercearia', 'https://tse4.mm.bing.net/th/id/OIP.nAmN42negpgI_eeTVJzXggHaF9?rs=1&pid=ImgDetMain&o=7&rm=3'),
('4', 'Bebidas', 'https://cdn-icons-png.freepik.com/512/3194/3194517.png')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, barcode, name, purchase_price, profit_margin, sale_price1, stock, image, category_id, is_offer, offer_price, min_offer_qty) VALUES
('p1', '789001', 'Banana Prata kg', 3.00, 66, 4.99, 100, 'https://cdn-icons-png.flaticon.com/512/2909/2909761.png', '1', true, 3.99, 3),
('p2', '789002', 'Maçã Gala kg', 4.50, 44, 6.50, 80, 'https://cdn-icons-png.flaticon.com/512/415/415733.png', '1', false, null, null),
('p3', '789003', 'Alcatra Bovina kg', 28.00, 42, 39.90, 25, 'https://cdn-icons-png.flaticon.com/512/3143/3143643.png', '2', false, null, null),
('p4', '789004', 'Sobrecoxa Frango kg', 8.50, 75, 14.90, 40, 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', '2', true, 12.90, 2),
('p5', '789005', 'Café Tradicional 500g', 11.00, 71, 18.90, 60, 'https://cdn-icons-png.flaticon.com/512/2835/2835154.png', '3', true, 15.90, 1),
('p6', '789006', 'Açúcar Refinado 1kg', 2.80, 60, 4.50, 120, 'https://cdn-icons-png.flaticon.com/512/5029/5029241.png', '3', false, null, null),
('p7', '789007', 'Coca-Cola 2L', 6.80, 47, 9.99, 48, 'https://cdn-icons-png.freepik.com/512/15595/15595920.png', '4', true, 8.99, 3),
('p8', '789008', 'Água Mineral 500ml', 0.60, 233, 2.00, 200, 'https://cdn-icons-png.flaticon.com/512/3100/3100566.png', '4', false, null, null)
ON CONFLICT (id) DO NOTHING;
