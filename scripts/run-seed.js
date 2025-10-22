import { seedTransactionsMonths } from './seed-transactions-months.js';

console.log('🚀 Iniciando script de povoamento...');

try {
  await seedTransactionsMonths();
  console.log('✅ Script executado com sucesso!');
} catch (error) {
  console.error('❌ Erro na execução:', error);
}