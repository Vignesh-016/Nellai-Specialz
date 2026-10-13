ALTER TABLE products
  ADD COLUMN IF NOT EXISTS why_nellai_specialz TEXT NULL AFTER storage_shelf_life;
