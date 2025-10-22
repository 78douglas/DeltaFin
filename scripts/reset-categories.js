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

async function resetCategories() {
  console.log('🔄 Resetando categorias...');
  
  try {
    // 1. Deletar todas as categorias existentes
    console.log('🗑️  Removendo categorias antigas...');
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      throw deleteError;
    }
    
    console.log('✅ Categorias antigas removidas!');
    
    // 2. Inserir novas categorias
    console.log('🌱 Inserindo novas categorias...');
    const { data, error } = await supabase
      .from('categories')
      .insert(defaultCategories)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ ${data.length} categorias inseridas com sucesso!`);
    console.log('\n📊 Categorias criadas:');
    
    const creditCategories = data.filter(cat => cat.type === 'credit');
    const debitCategories = data.filter(cat => cat.type === 'debit');
    
    console.log('\n💰 RECEITAS (CREDIT):');
    creditCategories.forEach(cat => {
      console.log(`  ${cat.order} - ${cat.icon} ${cat.name}`);
    });
    
    console.log('\n💸 DESPESAS (DEBIT):');
    debitCategories.forEach(cat => {
      console.log(`  ${cat.order} - ${cat.icon} ${cat.name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao resetar categorias:', error);
    process.exit(1);
  }
}

resetCategories()
  .then(() => {
    console.log('\n🎉 Reset concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro no reset:', error);
    process.exit(1);
  });