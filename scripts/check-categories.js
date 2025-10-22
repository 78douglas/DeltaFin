import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkCategories() {
  console.log('🔍 Verificando categorias...');
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('type', { ascending: true })
    .order('order', { ascending: true });
  
  if (error) {
    console.error('❌ Erro:', error);
    return;
  }
  
  console.log('\n📊 Categorias atuais:');
  console.log('='.repeat(50));
  
  const creditCategories = data.filter(cat => cat.type === 'credit');
  const debitCategories = data.filter(cat => cat.type === 'debit');
  
  console.log('\n💰 RECEITAS (CREDIT):');
  creditCategories.forEach(cat => {
    console.log(`  ${cat.order || 'N/A'} - ${cat.icon} ${cat.name}`);
  });
  
  console.log('\n💸 DESPESAS (DEBIT):');
  debitCategories.forEach(cat => {
    console.log(`  ${cat.order || 'N/A'} - ${cat.icon} ${cat.name}`);
  });
  
  console.log(`\n✅ Total: ${data.length} categorias`);
}

checkCategories()
  .then(() => {
    console.log('\n🎉 Verificação concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro na verificação:', error);
    process.exit(1);
  });