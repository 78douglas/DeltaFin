import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Transações fictícias para Agosto, Setembro e Outubro de 2025
const transactions = [
  // AGOSTO 2025 (15 transações)
  { date: '2025-08-01', description: 'Salário Mensal', amount: 5200, type: 'income', category_name: 'Salário' },
  { date: '2025-08-15', description: 'Freelance Design', amount: 850, type: 'income', category_name: 'Freelance' },
  { date: '2025-08-28', description: 'Venda Produto', amount: 320, type: 'income', category_name: 'Vendas' },
  
  { date: '2025-08-02', description: 'Aluguel', amount: 1200, type: 'expense', category_name: 'Moradia' },
  { date: '2025-08-03', description: 'Conta de Luz', amount: 180, type: 'expense', category_name: 'Contas' },
  { date: '2025-08-05', description: 'Supermercado Extra', amount: 350, type: 'expense', category_name: 'Alimentação' },
  { date: '2025-08-08', description: 'Gasolina', amount: 200, type: 'expense', category_name: 'Transporte' },
  { date: '2025-08-12', description: 'Consulta Médica', amount: 150, type: 'expense', category_name: 'Saúde' },
  { date: '2025-08-14', description: 'Cinema', amount: 45, type: 'expense', category_name: 'Lazer' },
  { date: '2025-08-18', description: 'Farmácia', amount: 85, type: 'expense', category_name: 'Saúde' },
  { date: '2025-08-20', description: 'Restaurante', amount: 120, type: 'expense', category_name: 'Alimentação' },
  { date: '2025-08-22', description: 'Roupas', amount: 280, type: 'expense', category_name: 'Compras' },
  { date: '2025-08-25', description: 'Uber', amount: 35, type: 'expense', category_name: 'Transporte' },
  { date: '2025-08-27', description: 'Conta de Internet', amount: 90, type: 'expense', category_name: 'Contas' },
  { date: '2025-08-30', description: 'Mercado', amount: 180, type: 'expense', category_name: 'Alimentação' },

  // SETEMBRO 2025 (18 transações)
  { date: '2025-09-01', description: 'Salário Mensal', amount: 5200, type: 'income', category_name: 'Salário' },
  { date: '2025-09-10', description: 'Freelance App', amount: 1200, type: 'income', category_name: 'Freelance' },
  { date: '2025-09-20', description: 'Dividendos', amount: 180, type: 'income', category_name: 'Investimentos' },
  { date: '2025-09-25', description: 'Venda Online', amount: 450, type: 'income', category_name: 'Vendas' },

  { date: '2025-09-02', description: 'Aluguel', amount: 1200, type: 'expense', category_name: 'Moradia' },
  { date: '2025-09-03', description: 'Conta de Água', amount: 95, type: 'expense', category_name: 'Contas' },
  { date: '2025-09-05', description: 'Supermercado', amount: 420, type: 'expense', category_name: 'Alimentação' },
  { date: '2025-09-07', description: 'Combustível', amount: 220, type: 'expense', category_name: 'Transporte' },
  { date: '2025-09-09', description: 'Academia', amount: 80, type: 'expense', category_name: 'Saúde' },
  { date: '2025-09-12', description: 'Pizza Delivery', amount: 65, type: 'expense', category_name: 'Alimentação' },
  { date: '2025-09-15', description: 'Shopping', amount: 350, type: 'expense', category_name: 'Compras' },
  { date: '2025-09-17', description: 'Curso Online', amount: 150, type: 'expense', category_name: 'Educação' },
  { date: '2025-09-19', description: 'Dentista', amount: 200, type: 'expense', category_name: 'Saúde' },
  { date: '2025-09-22', description: 'Streaming', amount: 35, type: 'expense', category_name: 'Lazer' },
  { date: '2025-09-24', description: 'Farmácia', amount: 75, type: 'expense', category_name: 'Saúde' },
  { date: '2025-09-26', description: 'Jantar Fora', amount: 140, type: 'expense', category_name: 'Alimentação' },
  { date: '2025-09-28', description: 'Cartão de Crédito', amount: 800, type: 'expense', category_name: 'Cartão de Crédito' },
  { date: '2025-09-30', description: 'Mercado', amount: 200, type: 'expense', category_name: 'Alimentação' },

  // OUTUBRO 2025 (20 transações)
  { date: '2025-10-01', description: 'Salário Mensal', amount: 5200, type: 'income', category_name: 'Salário' },
  { date: '2025-10-08', description: 'Freelance Website', amount: 950, type: 'income', category_name: 'Freelance' },
  { date: '2025-10-15', description: 'Bonificação', amount: 600, type: 'income', category_name: 'Salário' },
  { date: '2025-10-22', description: 'Venda Usados', amount: 280, type: 'income', category_name: 'Vendas' },
  { date: '2025-10-28', description: 'Rendimento Poupança', amount: 45, type: 'income', category_name: 'Investimentos' },

  { date: '2025-10-02', description: 'Aluguel', amount: 1200, type: 'expense', category_name: 'Moradia' },
  { date: '2025-10-03', description: 'Conta de Luz', amount: 195, type: 'expense', category_name: 'Contas' },
  { date: '2025-10-04', description: 'Supermercado', amount: 380, type: 'expense', category_name: 'Alimentação' },
  { date: '2025-10-06', description: 'Gasolina', amount: 210, type: 'expense', category_name: 'Transporte' },
  { date: '2025-10-09', description: 'Médico', amount: 180, type: 'expense', category_name: 'Saúde' },
  { date: '2025-10-11', description: 'Lanche', amount: 25, type: 'expense', category_name: 'Alimentação' },
  { date: '2025-10-13', description: 'Livros', amount: 120, type: 'expense', category_name: 'Educação' },
  { date: '2025-10-16', description: 'Cinema', amount: 50, type: 'expense', category_name: 'Lazer' },
  { date: '2025-10-18', description: 'Eletrônicos', amount: 450, type: 'expense', category_name: 'Compras' },
  { date: '2025-10-20', description: 'Restaurante', amount: 95, type: 'expense', category_name: 'Alimentação' },
  { date: '2025-10-23', description: 'Uber', amount: 28, type: 'expense', category_name: 'Transporte' },
  { date: '2025-10-25', description: 'Farmácia', amount: 65, type: 'expense', category_name: 'Saúde' },
  { date: '2025-10-27', description: 'Conta Telefone', amount: 85, type: 'expense', category_name: 'Contas' },
  { date: '2025-10-29', description: 'Mercado', amount: 220, type: 'expense', category_name: 'Alimentação' },
  { date: '2025-10-31', description: 'Presente', amount: 150, type: 'expense', category_name: 'Outros' }
];

async function seedTransactionsMonths() {
  console.log('🌱 Inserindo transações fictícias para Agosto, Setembro e Outubro...');
  
  try {
    // Buscar categorias existentes
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');
    
    if (categoriesError) {
      throw categoriesError;
    }
    
    if (!categories || categories.length === 0) {
      console.log('❌ Nenhuma categoria encontrada. Execute o script de categorias primeiro.');
      return;
    }
    
    console.log(`📋 Encontradas ${categories.length} categorias`);
    
    // Criar mapa de categorias
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    // Preparar transações com os campos corretos da tabela
    const transactionsWithIds = transactions.map(transaction => {
      // Verificar se a categoria existe
      if (!categoryMap[transaction.category_name]) {
        console.warn(`⚠️  Categoria '${transaction.category_name}' não encontrada`);
        return null;
      }
      
      // Mapear tipo: income -> credit, expense -> debit
      const mappedType = transaction.type === 'income' ? 'credit' : 'debit';
      
      return {
        description: transaction.description,
        amount: transaction.amount,
        type: mappedType,
        date: transaction.date,
        category_name: transaction.category_name,
        created_at: new Date().toISOString()
      };
    }).filter(Boolean); // Remove transações com categoria não encontrada
    
    console.log(`📊 Inserindo ${transactionsWithIds.length} transações...`);
    
    // Inserir transações em lotes para melhor performance
    const batchSize = 10;
    for (let i = 0; i < transactionsWithIds.length; i += batchSize) {
      const batch = transactionsWithIds.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('transactions')
        .insert(batch);
      
      if (insertError) {
        console.error(`❌ Erro ao inserir lote ${Math.floor(i/batchSize) + 1}:`, insertError);
        throw insertError;
      }
      
      console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} inserido com sucesso`);
    }
    
    console.log('🎉 Todas as transações foram inseridas com sucesso!');
    console.log(`📈 Total: ${transactionsWithIds.length} transações`);
    console.log('📅 Meses: Agosto, Setembro e Outubro de 2025');
    
  } catch (error) {
    console.error('❌ Erro ao inserir transações:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTransactionsMonths()
    .then(() => {
      console.log('✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na execução:', error);
      process.exit(1);
    });
}

export { seedTransactionsMonths };