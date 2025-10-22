import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkDuplicateCategories() {
  try {
    console.log('🔍 Verificando categorias duplicadas...');
    
    // Buscar todas as categorias
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      return;
    }
    
    console.log(`📊 Total de categorias encontradas: ${categories.length}`);
    
    // Verificar duplicatas por nome
    const categoryNames = categories.map(cat => cat.name);
    const duplicateNames = categoryNames.filter((name, index) => categoryNames.indexOf(name) !== index);
    
    if (duplicateNames.length > 0) {
      console.log('⚠️  Categorias duplicadas encontradas:');
      const uniqueDuplicates = [...new Set(duplicateNames)];
      
      for (const duplicateName of uniqueDuplicates) {
        const duplicateCategories = categories.filter(cat => cat.name === duplicateName);
        console.log(`\n📂 "${duplicateName}" (${duplicateCategories.length} ocorrências):`);
        duplicateCategories.forEach((cat, index) => {
          console.log(`  ${index + 1}. ID: ${cat.id}, Tipo: ${cat.type}, Criado em: ${cat.created_at}`);
        });
      }
    } else {
      console.log('✅ Nenhuma categoria duplicada encontrada!');
    }
    
    // Mostrar todas as categorias para análise
    console.log('\n📋 Lista completa de categorias:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.type}) - ID: ${cat.id}`);
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkDuplicateCategories();