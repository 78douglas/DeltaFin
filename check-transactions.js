import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTransactions() {
  console.log('🔍 Verificando transações no banco...');
  
  try {
    // Buscar transações
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (transError) {
      throw transError;
    }
    
    console.log(`📊 Total de transações: ${transactions?.length || 0}`);
    
    if (transactions && transactions.length > 0) {
      console.log('\n📋 Transações encontradas:');
      transactions.forEach((trans, index) => {
        console.log(`${index + 1}. ${trans.description}`);
        console.log(`   💰 Valor: R$ ${trans.amount}`);
        console.log(`   📅 Data: ${trans.date}`);
        console.log(`   🏷️ Categoria: ${trans.category_name}`);
        console.log(`   📝 Tipo: ${trans.type}`);
        console.log(`   🏷️ Tags: ${JSON.stringify(trans.tags)}`);
        console.log('   ---');
      });
    } else {
      console.log('⚠️ Nenhuma transação encontrada no banco.');
    }
    
    // Buscar categorias também
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
    
    if (catError) {
      throw catError;
    }
    
    console.log(`\n🏷️ Total de categorias: ${categories?.length || 0}`);
    if (categories && categories.length > 0) {
      console.log('\n📋 Categorias encontradas:');
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} ${cat.icon} (${cat.type})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar transações:', error);
  }
}

checkTransactions();