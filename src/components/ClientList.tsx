import { Eye, Pencil, PlusCircle, Trash2, Wallet } from 'lucide-react';
import { calculateClientDebt, formatCurrency } from '../lib/utils';
import type { Client } from '../types';

type Props = {
  clients: Client[];
  onViewHistory: (client: Client) => void;
  onEdit: (client: Client) => void;
  onAddDebt: (client: Client) => void;
  onRegisterPayment: (client: Client) => void;
  onDelete: (client: Client) => void;
};

export function ClientList({
  clients,
  onViewHistory,
  onEdit,
  onAddDebt,
  onRegisterPayment,
  onDelete,
}: Props) {
  if (clients.length === 0) {
    return <div className="empty-state">Nenhum cliente encontrado.</div>;
  }

  return (
    <div className="client-list">
      {clients.map((client) => {
        const debt = calculateClientDebt(client);

        return (
          <article key={client.id} className="client-card">
            <div className="client-main">
              <div>
                <h3>{client.nome}</h3>
                <p>{client.telefone || 'Sem telefone'} • {client.referencia || 'Sem referência'}</p>
              </div>
              <span className={`debt-badge ${debt > 0 ? 'danger' : 'neutral'}`}>
                {formatCurrency(debt)}
              </span>
            </div>

            <div className="client-secondary">
              <small>{client.endereco || 'Endereço não informado'}</small>
              <small>{client.transactions.length} movimentação(ões)</small>
            </div>

            <div className="client-actions">
              <button className="button primary" onClick={() => onAddDebt(client)} type="button">
                <PlusCircle size={16} /> Adicionar dívida
              </button>
              <button className="button success" onClick={() => onRegisterPayment(client)} type="button">
                <Wallet size={16} /> Registrar pagamento
              </button>
              <button className="button secondary" onClick={() => onViewHistory(client)} type="button">
                <Eye size={16} /> Histórico
              </button>
              <button className="button secondary" onClick={() => onEdit(client)} type="button">
                <Pencil size={16} /> Editar
              </button>
              <button className="button danger" onClick={() => onDelete(client)} type="button">
                <Trash2 size={16} /> Excluir
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
