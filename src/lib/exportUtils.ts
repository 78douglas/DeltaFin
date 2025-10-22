import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Transaction {
  id: string;
  description?: string;
  amount: number;
  type: 'credit' | 'debit';
  category_name: string;
  date: string;
  tags: string[];
  created_at: string;
}

interface ExportSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

// Função para formatar moeda brasileira
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função para formatar data brasileira
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Função para formatar tags
const formatTags = (tags: string[]): string => {
  if (!tags || tags.length === 0) return '';
  return tags.join(', ');
};

// Calcular resumo das transações
const calculateSummary = (transactions: Transaction[]): ExportSummary => {
  const totalIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    transactionCount: transactions.length
  };
};

// Exportar para CSV
export const exportToCSV = (transactions: Transaction[], filename?: string): void => {
  const summary = calculateSummary(transactions);
  
  // Preparar dados das transações
  const csvData = transactions.map(transaction => ({
    'Data': formatDate(transaction.date),
    'Descrição': transaction.description || 'Sem descrição',
    'Categoria': transaction.category_name || 'Sem categoria',
    'Tag': formatTags(transaction.tags),
    'Tipo': transaction.type === 'credit' ? 'Receita' : 'Despesa',
    'Valor': formatCurrency(transaction.amount)
  }));

  // Adicionar resumo no final
  csvData.push({} as any); // Linha vazia
  csvData.push({
    'Data': 'RESUMO',
    'Descrição': '',
    'Categoria': '',
    'Tag': '',
    'Tipo': '',
    'Valor': ''
  } as any);
  csvData.push({
    'Data': 'Total de Receitas',
    'Descrição': '',
    'Categoria': '',
    'Tag': '',
    'Tipo': '',
    'Valor': formatCurrency(summary.totalIncome)
  } as any);
  csvData.push({
    'Data': 'Total de Despesas',
    'Descrição': '',
    'Categoria': '',
    'Tag': '',
    'Tipo': '',
    'Valor': formatCurrency(summary.totalExpenses)
  } as any);
  csvData.push({
    'Data': 'Saldo',
    'Descrição': '',
    'Categoria': '',
    'Tag': '',
    'Tipo': '',
    'Valor': formatCurrency(summary.balance)
  } as any);

  // Converter para CSV
  const headers = Object.keys(csvData[0] || {});
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => 
      headers.map(header => {
        const value = (row as any)[header] || '';
        // Escapar aspas e adicionar aspas se necessário
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  // Download do arquivo
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Exportar para PDF
export const exportToPDF = (transactions: Transaction[], filename?: string): void => {
  const summary = calculateSummary(transactions);
  const doc = new jsPDF();

  // Configurar fonte para suportar caracteres especiais
  doc.setFont('helvetica');

  // Título
  doc.setFontSize(20);
  doc.text('Relatório de Transações', 20, 20);

  // Data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 30);

  // Resumo
  doc.setFontSize(14);
  doc.text('Resumo:', 20, 45);
  
  doc.setFontSize(10);
  doc.text(`Total de transações: ${summary.transactionCount}`, 20, 55);
  doc.text(`Total de receitas: ${formatCurrency(summary.totalIncome)}`, 20, 62);
  doc.text(`Total de despesas: ${formatCurrency(summary.totalExpenses)}`, 20, 69);
  doc.text(`Saldo: ${formatCurrency(summary.balance)}`, 20, 76);

  // Agrupar transações por mês
  const transactionsByMonth = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        name: monthName,
        transactions: [],
        income: 0,
        expenses: 0
      };
    }
    
    acc[monthKey].transactions.push(transaction);
    
    if (transaction.type === 'credit') {
      acc[monthKey].income += transaction.amount;
    } else {
      acc[monthKey].expenses += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, { name: string; transactions: Transaction[]; income: number; expenses: number }>);

  // Ordenar meses por data (mais recente primeiro)
  const sortedMonths = Object.entries(transactionsByMonth).sort(([a], [b]) => b.localeCompare(a));

  let currentY = 85;

  // Criar tabelas por mês
  sortedMonths.forEach(([monthKey, monthData], index) => {
    // Verificar se precisa de nova página
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    // Título do mês
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(monthData.name.charAt(0).toUpperCase() + monthData.name.slice(1), 20, currentY);
    currentY += 10;

    // Subtotal do mês
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receitas: ${formatCurrency(monthData.income)} | Despesas: ${formatCurrency(monthData.expenses)} | Saldo: ${formatCurrency(monthData.income - monthData.expenses)}`, 20, currentY);
    currentY += 10;

    // Preparar dados da tabela com cores
    const tableData = monthData.transactions.map(transaction => [
      formatDate(transaction.date),
      transaction.description || 'Sem descrição',
      transaction.category_name || 'Sem categoria',
      formatTags(transaction.tags),
      transaction.type === 'credit' ? 'Receita' : 'Despesa',
      formatCurrency(transaction.amount)
    ]);

    // Criar tabela
    autoTable(doc, {
      head: [['Data', 'Descrição', 'Categoria', 'Tag', 'Tipo', 'Valor']],
      body: tableData,
      startY: currentY,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 20 }, // Data
        1: { cellWidth: 45 }, // Descrição
        2: { cellWidth: 28 }, // Categoria
        3: { cellWidth: 22 }, // Tag
        4: { cellWidth: 18 }, // Tipo
        5: { cellWidth: 25, halign: 'right' } // Valor
      },
      // Aplicar cores baseadas no tipo de transação
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 4) { // Coluna Tipo
          const transaction = monthData.transactions[data.row.index];
          if (transaction) {
            if (transaction.type === 'credit') {
              data.cell.styles.textColor = [59, 130, 246]; // Azul para receitas
            } else {
              data.cell.styles.textColor = [239, 68, 68]; // Vermelho para despesas
            }
          }
        }
        if (data.section === 'body' && data.column.index === 5) { // Coluna Valor
          const transaction = monthData.transactions[data.row.index];
          if (transaction) {
            if (transaction.type === 'credit') {
              data.cell.styles.textColor = [59, 130, 246]; // Azul para receitas
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [239, 68, 68]; // Vermelho para despesas
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      }
    });

    // Atualizar posição Y para próxima seção
    currentY = (doc as any).lastAutoTable.finalY + 15;
  });

  // Download do arquivo
  doc.save(filename || `transacoes_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Exportar para Excel
export const exportToXLS = (transactions: Transaction[], filename?: string): void => {
  const summary = calculateSummary(transactions);

  // Preparar dados das transações
  const worksheetData = [
    ['Data', 'Descrição', 'Categoria', 'Tag', 'Tipo', 'Valor'],
    ...transactions.map(transaction => [
      formatDate(transaction.date),
      transaction.description || 'Sem descrição',
      transaction.category_name || 'Sem categoria',
      formatTags(transaction.tags),
      transaction.type === 'credit' ? 'Receita' : 'Despesa',
      transaction.amount // Manter como número para Excel
    ]),
    [], // Linha vazia
    ['RESUMO', '', '', '', '', ''],
    ['Total de Receitas', '', '', '', '', summary.totalIncome],
    ['Total de Despesas', '', '', '', '', summary.totalExpenses],
    ['Saldo', '', '', '', '', summary.balance],
    [], // Linha vazia
    [`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, '', '', '', '', '']
  ];

  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Configurar largura das colunas
  ws['!cols'] = [
    { wch: 12 }, // Data
    { wch: 35 }, // Descrição
    { wch: 18 }, // Categoria
    { wch: 20 }, // Tag
    { wch: 12 }, // Tipo
    { wch: 15 }  // Valor
  ];

  // Aplicar formatação e cores
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  
  // Formatar células de moeda e aplicar cores
  for (let row = 1; row <= range.e.r; row++) {
    const transaction = transactions[row - 1]; // -1 porque a primeira linha é o cabeçalho
    
    // Formatar coluna de valor (F)
    const valueCellAddress = XLSX.utils.encode_cell({ r: row, c: 5 });
    if (ws[valueCellAddress] && typeof ws[valueCellAddress].v === 'number') {
      ws[valueCellAddress].z = '"R$" #,##0.00';
      
      // Aplicar cores baseadas no tipo de transação
      if (transaction) {
        if (!ws[valueCellAddress].s) ws[valueCellAddress].s = {};
        if (transaction.type === 'credit') {
          // Azul para receitas
          ws[valueCellAddress].s.font = { color: { rgb: "3B82F6" }, bold: true };
        } else {
          // Vermelho para despesas
          ws[valueCellAddress].s.font = { color: { rgb: "EF4444" }, bold: true };
        }
      }
    }
    
    // Aplicar cores na coluna Tipo (E)
    const typeCellAddress = XLSX.utils.encode_cell({ r: row, c: 4 });
    if (ws[typeCellAddress] && transaction) {
      if (!ws[typeCellAddress].s) ws[typeCellAddress].s = {};
      if (transaction.type === 'credit') {
        // Azul para receitas
        ws[typeCellAddress].s.font = { color: { rgb: "3B82F6" }, bold: true };
      } else {
        // Vermelho para despesas
        ws[typeCellAddress].s.font = { color: { rgb: "EF4444" }, bold: true };
      }
    }
  }

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Transações');

  // Download do arquivo
  XLSX.writeFile(wb, filename || `transacoes_${new Date().toISOString().split('T')[0]}.xlsx`);
};