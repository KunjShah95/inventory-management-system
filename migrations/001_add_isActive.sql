-- Migration: Add isActive column to products table for soft-delete support
-- Run this in Supabase SQL editor or with psql connected to your DB

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;

-- Ensure existing rows are active by default
UPDATE public.products SET "isActive" = true WHERE "isActive" IS NULL;

-- Optional: index to make queries filtering by isActive fast
CREATE INDEX IF NOT EXISTS idx_products_isActive ON public.products ("isActive");

-- If you have an active_products view defined, you may need to recreate it to reference the new column:
-- DROP VIEW IF EXISTS public.active_products;
-- CREATE VIEW public.active_products AS
-- SELECT * FROM public.products WHERE "isActive" = true;
