const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function seedTransactions() {
  console.log('🌱 Inserindo transações de exemplo...');
  
  try {
    // Buscar categorias existentes
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');
    
    if (categoriesError) {
      throw categoriesError;
    }
    
    if (!categories || categories.length === 0) {
      console.log('⚠️  Nenhuma categoria encontrada. Execute primeiro o seed de categorias.');
      return;
    }
    
    // Encontrar categorias específicas
    const alimentacaoCategory = categories.find(cat => cat.name === 'Alimentação');
    const transporteCategory = categories.find(cat => cat.name === 'Transporte');
    const moradiaCategory = categories.find(cat => cat.name === 'Moradia');
    const salarioCategory = categories.find(cat => cat.name === 'Salário');
    const freelanceCategory = categories.find(cat => cat.name === 'Freelance');
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Transações de exemplo para o mês atual
    const sampleTransactions = [
      // Receitas
      {
        description: 'Salário Mensal',
        amount: 3500.00,
        type: 'credit',
        category_id: salarioCategory?.id || categories[0].id,
        date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
      },
      {
        description: 'Projeto Freelance',
        amount: 800.00,
        type: 'credit',
        category_id: freelanceCategory?.id || categories[0].id,
        date: new Date(currentYear, currentMonth, 15).toISOString().split('T')[0]
      },
      
      // Despesas
      {
        description: 'Supermercado',
        amount: 250.00,
        type: 'debit',
        category_id: alimentacaoCategory?.id || categories[0].id,
        date: new Date(currentYear, currentMonth, 5).toISOString().split('T')[0]
      },
      {
        description: 'Restaurante',
        amount: 85.50,
        type: 'debit',
        category_id: alimentacaoCategory?.id || categories[0].id,
        date: new Date(currentYear, currentMonth, 10).toISOString().split('T')[0]
      },
      {
        description: 'Combustível',
        amount: 120.00,
        type: 'debit',
        category_id: transporteCategory?.id || categories[0].id,
        date: new Date(currentYear, currentMonth, 8).toISOString().split('T')[0]
      },
      {
        description: 'Uber',
        amount: 25.00,
        type: 'debit',
        category_id: transporteCategory?.id || categories[0].id,
        date: new Date(currentYear, currentMonth, 12).toISOString().split('T')[0]
      },
      {
        description: 'Aluguel',
        amount: 1200.00,
        type: 'debit',
        category_id: moradiaCategory?.id || categories[0].id,
        date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
      },
      {
        description: 'Conta de Luz',
        amount: 180.00,
        type: 'debit',
        category_id: moradiaCategory?.id || categories[0].id,
        date: new Date(currentYear, currentMonth, 3).toISOString().split('T')[0]
      }
    ];
    
    // Limpar transações existentes primeiro
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.log('⚠️  Erro ao limpar transações:', deleteError);
    } else {
      console.log('🗑️  Transações existentes removidas.');
    }
    
    // Inserir transações de exemplo
    const { data, error } = await supabase
      .from('transactions')
      .insert(sampleTransactions)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ ${data.length} transações inseridas com sucesso!`);
    console.log('Transações criadas:');
    data.forEach(trans => {
      const type = trans.type === 'credit' ? '💰' : '💸';
      console.log(`  ${type} ${trans.description} - R$ ${trans.amount}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao inserir transações:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedTransactions()
    .then(() => {
      console.log('🎉 Seed de transações concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro no seed:', error);
      process.exit(1);
    });
}

module.exports = { seedTransactions };