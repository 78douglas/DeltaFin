import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔗 Testando conexão com Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Configurada' : 'Não configurada');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n📊 Testando query de transações...');
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('❌ Erro na query:', error);
      return;
    }

    console.log(`✅ Sucesso! ${data?.length || 0} transações encontradas`);
    
    if (data && data.length > 0) {
      console.log('\n📋 Primeiras 3 transações:');
      data.slice(0, 3).forEach((transaction, index) => {
        console.log(`${index + 1}. ${transaction.description} - R$ ${transaction.amount} (${transaction.category_name})`);
      });
    }

  } catch (error) {
    console.error('💥 Erro na conexão:', error);
  }
}

testConnection();