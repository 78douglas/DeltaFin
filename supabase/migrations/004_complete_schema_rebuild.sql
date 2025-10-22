-- Migration: Complete schema rebuild to fix transaction insertion issues
-- This migration will completely rebuild the tables to ensure correct structure

-- Drop existing tables and recreate them with correct structure
DROP TABLE IF EXISTS goal_contributions CASCADE;
DROP TABLE IF EXISTS savings_goals CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create categories table with correct structure
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    icon VARCHAR NOT NULL,
    color VARCHAR NOT NULL,
    type VARCHAR NOT NULL DEFAULT 'debit' CHECK (type IN ('credit', 'debit')),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create transactions table with correct structure
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount NUMERIC NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type VARCHAR NOT NULL DEFAULT 'debit' CHECK (type IN ('credit', 'debit')),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create savings_goals table
CREATE TABLE savings_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC DEFAULT 0,
    target_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create goal_contributions table
CREATE TABLE goal_contributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default categories for debit (expenses)
INSERT INTO categories (name, icon, color, type, is_default) VALUES
('Moradia', 'home', '#3B82F6', 'debit', true),
('Alimentação', 'shopping-cart', '#EF4444', 'debit', true),
('Transporte', 'car', '#10B981', 'debit', true),
('Saúde', 'heart', '#F59E0B', 'debit', true),
('Lazer', 'gamepad-2', '#8B5CF6', 'debit', true),
('Educação', 'graduation-cap', '#EC4899', 'debit', true),
('Cartão de Crédito', 'credit-card', '#06B6D4', 'debit', true),
('Outros', 'more-horizontal', '#84CC16', 'debit', true);

-- Insert default categories for credit (income)
INSERT INTO categories (name, icon, color, type, is_default) VALUES
('Salário', 'briefcase', '#10B981', 'credit', true),
('Freelance', 'dollar-sign', '#3B82F6', 'credit', true),
('Investimentos', 'trending-up', '#8B5CF6', 'credit', true),
('Presente', 'gift', '#EC4899', 'credit', true),
('Venda', 'shopping-bag', '#F59E0B', 'credit', true),
('Outros', 'more-horizontal', '#84CC16', 'credit', true);

-- Create indexes for better performance
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_categories_type ON categories(type);

-- Disable RLS for development (re-enable in production)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions DISABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE categories IS 'RLS desabilitado para desenvolvimento - reabilitar em produção';
COMMENT ON TABLE transactions IS 'RLS desabilitado para desenvolvimento - reabilitar em produção';
COMMENT ON TABLE savings_goals IS 'RLS desabilitado para desenvolvimento - reabilitar em produção';
COMMENT ON TABLE goal_contributions IS 'RLS desabilitado para desenvolvimento - reabilitar em produção';

COMMENT ON COLUMN categories.type IS 'Tipo da categoria: credit (receita) ou debit (despesa)';
COMMENT ON COLUMN transactions.type IS 'Tipo da transação: credit (receita) ou debit (despesa)';