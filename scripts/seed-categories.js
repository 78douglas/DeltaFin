import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const defaultCategories = [
  // Categorias de Crédito (4 colunas x 2 linhas)
  { name: 'Salário', icon: '💰', type: 'credit', is_default: true, order: 1 },
  { name: 'Freelance', icon: '💻', type: 'credit', is_default: true, order: 2 },
  { name: 'Presente', icon: '🎁', type: 'credit', is_default: true, order: 3 },
  { name: 'Vendas', icon: '🛒', type: 'credit', is_default: true, order: 4 },
  { name: 'Emprestimo', icon: '💵', type: 'credit', is_default: true, order: 5 },
  { name: 'Outras Receitas', icon: '📈', type: 'credit', is_default: true, order: 6 },

  // Categorias de Débito (4 colunas x 2 linhas)
  { name: 'Alimentação', icon: '🍽️', type: 'debit', is_default: true, order: 1 },
  { name: 'Moradia', icon: '🏠', type: 'debit', is_default: true, order: 2 },
  { name: 'Lazer', icon: '🎮', type: 'debit', is_default: true, order: 3 },
  { name: 'Saúde', icon: '🏥', type: 'debit', is_default: true, order: 4 },
  { name: 'Transporte', icon: '🚗', type: 'debit', is_default: true, order: 5 },
  { name: 'Educação', icon: '📚', type: 'debit', is_default: true, order: 6 },
  { name: 'Dividas', icon: '💳', type: 'debit', is_default: true, order: 7 },
  { name: 'Outras Despesas', icon: '💸', type: 'debit', is_default: true, order: 8 }
];

async function seedCategories() {
  console.log('🌱 Inserindo categorias padrão...');
  
  try {
    // Verificar se já existem categorias
    const { data: existingCategories, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (checkError) {
      throw checkError;
    }
    
    if (existingCategories && existingCategories.length > 0) {
      console.log('⚠️  Categorias já existem. Pulando inserção.');
      return;
    }
    
    // Inserir categorias padrão
    const { data, error } = await supabase
      .from('categories')
      .insert(defaultCategories)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ ${data.length} categorias inseridas com sucesso!`);
    console.log('Categorias criadas:');
    data.forEach(cat => {
      console.log(`  ${cat.icon} ${cat.name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao inserir categorias:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCategories()
    .then(() => {
      console.log('🎉 Seed concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro no seed:', error);
      process.exit(1);
    });
}

export { seedCategories, defaultCategories };