-- DeltaFin v1.0 - Desabilitar RLS temporariamente para teste

-- Desabilitar RLS nas tabelas para permitir acesso anônimo durante desenvolvimento
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions DISABLE ROW LEVEL SECURITY;

-- Comentário para lembrar de reabilitar em produção
COMMENT ON TABLE categories IS 'RLS desabilitado para desenvolvimento - reabilitar em produção';
COMMENT ON TABLE transactions IS 'RLS desabilitado para desenvolvimento - reabilitar em produção';
COMMENT ON TABLE savings_goals IS 'RLS desabilitado para desenvolvimento - reabilitar em produção';
COMMENT ON TABLE goal_contributions IS 'RLS desabilitado para desenvolvimento - reabilitar em produção';