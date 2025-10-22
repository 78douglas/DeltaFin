-- DeltaFin v1.0 - Criação das tabelas principais

-- Criar tabela de categorias
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para categorias
CREATE INDEX idx_categories_is_default ON categories(is_default);

-- Inserir categorias padrão
INSERT INTO categories (name, icon, color, is_default) VALUES
('Alimentação', 'utensils', '#F59E0B', true),
('Transporte', 'car', '#3B82F6', true),
('Saúde', 'heart', '#EF4444', true),
('Lazer', 'gamepad-2', '#8B5CF6', true),
('Educação', 'book', '#10B981', true),
('Casa', 'home', '#F97316', true),
('Trabalho', 'briefcase', '#6B7280', true),
('Outros', 'more-horizontal', '#9CA3AF', true);

-- Políticas RLS para categorias
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON categories TO anon;
GRANT ALL PRIVILEGES ON categories TO authenticated;

-- Criar tabela de transações
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para transações
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_amount ON transactions(amount);

-- Políticas RLS para transações
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON transactions TO anon;
GRANT ALL PRIVILEGES ON transactions TO authenticated;

-- Criar tabela de metas de poupança
CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(10,2) DEFAULT 0 CHECK (current_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para metas
CREATE INDEX idx_savings_goals_created_at ON savings_goals(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_savings_goals_updated_at 
    BEFORE UPDATE ON savings_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS para metas
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON savings_goals TO anon;
GRANT ALL PRIVILEGES ON savings_goals TO authenticated;

-- Criar tabela de contribuições para metas
CREATE TABLE goal_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para contribuições
CREATE INDEX idx_goal_contributions_goal_id ON goal_contributions(goal_id);
CREATE INDEX idx_goal_contributions_created_at ON goal_contributions(created_at DESC);

-- Trigger para atualizar current_amount na meta
CREATE OR REPLACE FUNCTION update_goal_current_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE savings_goals 
        SET current_amount = current_amount + NEW.amount
        WHERE id = NEW.goal_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE savings_goals 
        SET current_amount = current_amount - OLD.amount
        WHERE id = OLD.goal_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_goal_amount
    AFTER INSERT OR DELETE ON goal_contributions
    FOR EACH ROW EXECUTE FUNCTION update_goal_current_amount();

-- Políticas RLS para contribuições
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON goal_contributions TO anon;
GRANT ALL PRIVILEGES ON goal_contributions TO authenticated;