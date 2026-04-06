import type { Client, ClientTransaction } from '../types';

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateString));
}

export function generateId() {
  return crypto.randomUUID();
}

export function calculateDebt(transactions: ClientTransaction[]) {
  return transactions.reduce((acc, item) => {
    return item.type === 'debt' ? acc + item.value : acc - item.value;
  }, 0);
}

export function calculateClientDebt(client: Client) {
  return calculateDebt(client.transactions);
}

export function sortByDebtDesc<T extends Client>(clients: T[]): T[] {
  return [...clients].sort((a, b) => calculateClientDebt(b) - calculateClientDebt(a));
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
