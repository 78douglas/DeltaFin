-- Migration: Add order field to categories table
-- This migration adds an 'order' field to control the display order of categories

-- Add order column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Update existing categories with default order values
-- Credit categories
UPDATE categories 
SET "order" = CASE 
  WHEN name = 'Salário' THEN 1
  WHEN name = 'Freelance' THEN 2
  WHEN name = 'Presente' THEN 3
  WHEN name = 'Vendas' THEN 4
  WHEN name = 'Emprestimo' THEN 5
  WHEN name = 'Outras Receitas' THEN 6
  WHEN name = 'Investimentos' THEN 6 -- fallback for old data
  WHEN name = 'Outros' AND type = 'credit' THEN 6 -- fallback for old data
  ELSE 99
END
WHERE type = 'credit';

-- Debit categories  
UPDATE categories 
SET "order" = CASE 
  WHEN name = 'Alimentação' THEN 1
  WHEN name = 'Moradia' THEN 2
  WHEN name = 'Lazer' THEN 3
  WHEN name = 'Saúde' THEN 4
  WHEN name = 'Transporte' THEN 5
  WHEN name = 'Educação' THEN 6
  WHEN name = 'Dividas' THEN 7
  WHEN name = 'Outras Despesas' THEN 8
  -- Fallbacks for old categories
  WHEN name = 'Compras' THEN 8
  WHEN name = 'Contas' THEN 8
  WHEN name = 'Cartão de Crédito' THEN 7
  WHEN name = 'Outros' AND type = 'debit' THEN 8
  ELSE 99
END
WHERE type = 'debit';

-- Create index for better performance when ordering
CREATE INDEX IF NOT EXISTS idx_categories_type_order ON categories(type, "order");

-- Grant permissions to roles
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT SELECT ON categories TO anon;