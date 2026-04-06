export type TransactionType = 'debt' | 'payment';

export type ClientTransaction = {
  id: string;
  type: TransactionType;
  value: number;
  note?: string;
  createdAt: string;
};

export type Client = {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
  referencia: string;
  transactions: ClientTransaction[];
  createdAt: string;
  updatedAt: string;
};

export type ClientFormValues = {
  nome: string;
  telefone: string;
  endereco: string;
  referencia: string;
};

export type TransactionFormValues = {
  value: string;
  note: string;
};

export type ToastMessage = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
};
