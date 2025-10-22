-- DeltaFin v1.0 - Correção de compatibilidade de schema

-- Adicionar campo 'type' na tabela transactions
ALTER TABLE transactions 
ADD COLUMN type VARCHAR(10) NOT NULL DEFAULT 'debit' 
CHECK (type IN ('credit', 'debit'));

-- Renomear transaction_date para date para compatibilidade
ALTER TABLE transactions 
RENAME COLUMN transaction_date TO date;

-- Adicionar campo 'type' na tabela categories
ALTER TABLE categories 
ADD COLUMN type VARCHAR(10) NOT NULL DEFAULT 'debit' 
CHECK (type IN ('credit', 'debit'));

-- Atualizar categorias existentes com tipos apropriados
UPDATE categories SET type = 'debit' WHERE name IN ('Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Casa', 'Outros');
UPDATE categories SET type = 'credit' WHERE name = 'Trabalho';

-- Adicionar mais categorias de crédito se necessário
INSERT INTO categories (name, icon, color, is_default, type) VALUES
('Salário', 'dollar-sign', '#10B981', true, 'credit'),
('Freelance', 'users', '#3B82F6', true, 'credit'),
('Investimentos', 'trending-up', '#8B5CF6', true, 'credit'),
('Vendas', 'shopping-bag', '#F59E0B', true, 'credit'),
('Presente', 'gift', '#EF4444', true, 'credit')
ON CONFLICT DO NOTHING;

-- Criar índices para os novos campos
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_categories_type ON categories(type);

-- Comentários para documentação
COMMENT ON COLUMN transactions.type IS 'Tipo da transação: credit (receita) ou debit (despesa)';
COMMENT ON COLUMN categories.type IS 'Tipo da categoria: credit (receita) ou debit (despesa)';