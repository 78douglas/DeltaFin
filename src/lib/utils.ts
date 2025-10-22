import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Funções utilitárias para conversão de datas

/**
 * Converte uma data do formato brasileiro (DD/MM/AAAA) para o formato ISO (AAAA-MM-DD)
 * @param brazilianDate - Data no formato DD/MM/AAAA
 * @returns Data no formato ISO (AAAA-MM-DD) ou null se inválida
 */
export function brazilianToISO(brazilianDate: string): string | null {
  if (!brazilianDate) return null;
  
  const parts = brazilianDate.split('/');
  if (parts.length !== 3) return null;
  
  const [day, month, year] = parts;
  
  // Validação básica
  if (!day || !month || !year) return null;
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return null;
  
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  // Validação de ranges
  if (dayNum < 1 || dayNum > 31) return null;
  if (monthNum < 1 || monthNum > 12) return null;
  if (yearNum < 1900 || yearNum > 2100) return null;
  
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma data do formato ISO (AAAA-MM-DD) para o formato brasileiro (DD/MM/AAAA)
 * @param isoDate - Data no formato ISO (AAAA-MM-DD)
 * @returns Data no formato brasileiro (DD/MM/AAAA) ou null se inválida
 */
export function isoToBrazilian(isoDate: string): string | null {
  if (!isoDate) return null;
  
  const parts = isoDate.split('-');
  if (parts.length !== 3) return null;
  
  const [year, month, day] = parts;
  
  // Validação básica
  if (!year || !month || !day) return null;
  if (year.length !== 4 || month.length !== 2 || day.length !== 2) return null;
  
  return `${day}/${month}/${year}`;
}

/**
 * Valida se uma string está no formato brasileiro de data (DD/MM/AAAA)
 * @param dateString - String a ser validada
 * @returns true se válida, false caso contrário
 */
export function isValidBrazilianDate(dateString: string): boolean {
  if (!dateString) return false;
  
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateString)) return false;
  
  const parts = dateString.split('/');
  const [day, month, year] = parts.map(part => parseInt(part, 10));
  
  // Validação de ranges
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;
  
  // Validação mais específica usando Date
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}

/**
 * Formata uma data para o formato brasileiro (DD/MM/AAAA)
 * @param date - Objeto Date ou string ISO
 * @returns Data formatada em DD/MM/AAAA
 */
export function formatToBrazilian(date: Date | string): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString();
  
  return `${day}/${month}/${year}`;
}

/**
 * Converte uma data brasileira para objeto Date
 * @param brazilianDate - Data no formato DD/MM/AAAA
 * @returns Objeto Date ou null se inválida
 */
export function brazilianToDate(brazilianDate: string): Date | null {
  const isoDate = brazilianToISO(brazilianDate);
  if (!isoDate) return null;
  
  const date = new Date(isoDate);
  return isNaN(date.getTime()) ? null : date;
}
