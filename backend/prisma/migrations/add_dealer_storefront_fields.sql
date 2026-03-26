-- Add storefront/profile fields to Dealer table
ALTER TABLE "Dealer"
  ADD COLUMN IF NOT EXISTS "shopImages"       TEXT[]    DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "description"      TEXT,
  ADD COLUMN IF NOT EXISTS "establishedYear"  INTEGER,
  ADD COLUMN IF NOT EXISTS "certifications"   TEXT[]    DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "website"          TEXT;
