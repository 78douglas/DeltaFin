import { seedTransactionsMonths } from './seed-transactions-months.js';

console.log('🚀 Iniciando script de teste...');

seedTransactionsMonths()
  .then(() => {
    console.log('✅ Script executado com sucesso!');
  })
  .catch((error) => {
    console.error('❌ Erro na execução:', error);
  });