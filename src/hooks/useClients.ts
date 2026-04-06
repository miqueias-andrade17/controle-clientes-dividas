import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { generateId } from '../lib/utils';
import type { Client, ClientFormValues, ClientTransaction, TransactionType } from '../types';

type ClientWithDocId = Client & { __docId: string };

const clientsCollection = collection(db, 'clients');

export function useClients() {
  const [clients, setClients] = useState<ClientWithDocId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientsQuery = query(clientsCollection, orderBy('nome'));

    const unsubscribe = onSnapshot(clientsQuery, (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        ...(item.data() as Client),
        __docId: item.id,
      }));
      setClients(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function createClient(values: ClientFormValues) {
    const now = new Date().toISOString();
    const client: Client = {
      id: generateId(),
      nome: values.nome.trim(),
      telefone: values.telefone.trim(),
      endereco: values.endereco.trim(),
      referencia: values.referencia.trim(),
      transactions: [],
      createdAt: now,
      updatedAt: now,
    };

    await addDoc(clientsCollection, client);
  }

  async function updateClient(id: string, values: ClientFormValues) {
    const existing = clients.find((client) => client.id === id);
    if (!existing) throw new Error('Cliente não encontrado.');

    const updated: Client = {
      id: existing.id,
      nome: values.nome.trim(),
      telefone: values.telefone.trim(),
      endereco: values.endereco.trim(),
      referencia: values.referencia.trim(),
      transactions: existing.transactions,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'clients', existing.__docId), updated);
  }

  async function removeClient(id: string) {
    const existing = clients.find((client) => client.id === id);
    if (!existing) throw new Error('Cliente não encontrado.');
    await deleteDoc(doc(db, 'clients', existing.__docId));
  }

  async function addTransaction(clientId: string, type: TransactionType, value: number, note: string) {
    const existing = clients.find((client) => client.id === clientId);
    if (!existing) throw new Error('Cliente não encontrado.');

    const transaction: ClientTransaction = {
      id: generateId(),
      type,
      value,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated: Client = {
      id: existing.id,
      nome: existing.nome,
      telefone: existing.telefone,
      endereco: existing.endereco,
      referencia: existing.referencia,
      transactions: [transaction, ...existing.transactions],
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'clients', existing.__docId), updated);
  }

  async function replaceAllClients(data: Client[]) {
    const snapshot = await getDocs(clientsCollection);
    const batch = writeBatch(db);

    snapshot.docs.forEach((docItem) => {
      batch.delete(docItem.ref);
    });

    data.forEach((client) => {
      const cleaned: Client = {
        id: client.id || generateId(),
        nome: (client.nome || '').trim(),
        telefone: (client.telefone || '').trim(),
        endereco: (client.endereco || '').trim(),
        referencia: (client.referencia || '').trim(),
        transactions: Array.isArray(client.transactions) ? client.transactions : [],
        createdAt: client.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      batch.set(doc(clientsCollection), cleaned);
    });

    await batch.commit();
  }

  return {
    clients,
    loading,
    createClient,
    updateClient,
    removeClient,
    addTransaction,
    replaceAllClients,
  };
}
