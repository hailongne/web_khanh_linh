-- Enable UUID Extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'BLOG_EDITOR',
  permissions JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Table 2: sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  expire TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: categories
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: posts
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL,
  excerpt JSONB,
  thumbnail TEXT,
  category TEXT,
  status TEXT DEFAULT 'published',
  featured BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  author_id TEXT,
  blocks JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo JSONB DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 5: site_settings (pricing, sales, contacts, testimonials, faq)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 6: vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT NOT NULL,
  lang TEXT NOT NULL,
  name TEXT NOT NULL,
  badge TEXT,
  price TEXT,
  image TEXT,
  specs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, lang)
);

-- Storage bucket setup (Public Access)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy setup with DROP IF EXISTS
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;

CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Public Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Public Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'media');
CREATE POLICY "Public Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'media');
