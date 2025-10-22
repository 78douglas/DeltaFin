-- Migration: Update categories and transactions structure
-- Remove color field from categories and change transactions to use category names instead of UUIDs

-- Step 1: Create a temporary column in transactions to store category names
ALTER TABLE transactions ADD COLUMN category_name VARCHAR;

-- Step 2: Update existing transactions to use category names
UPDATE transactions 
SET category_name = (
    SELECT name 
    FROM categories 
    WHERE categories.id = transactions.category_id
)
WHERE category_id IS NOT NULL;

-- Step 3: Drop the old category_id column and its foreign key constraint
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_category_id_fkey;
ALTER TABLE transactions DROP COLUMN category_id;

-- Step 4: Remove color column from categories table
ALTER TABLE categories DROP COLUMN IF EXISTS color;

-- Step 5: Create new indexes for better performance
CREATE INDEX idx_transactions_category_name ON transactions(category_name);
DROP INDEX IF EXISTS idx_transactions_category_id;

-- Step 6: Add constraint to ensure category_name references existing categories
-- Note: We'll handle this at application level for flexibility with CSV imports

-- Comments
COMMENT ON COLUMN transactions.category_name IS 'Nome da categoria - facilita importação de CSV';
COMMENT ON TABLE categories IS 'Categorias agora usam apenas emojis (sem cores) e são referenciadas por nome';