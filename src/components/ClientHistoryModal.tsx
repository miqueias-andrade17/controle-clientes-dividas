import type { Client } from '../types';
import { calculateClientDebt, formatCurrency, formatDate } from '../lib/utils';
import { Modal } from './Modal';

type Props = {
  open: boolean;
  client: Client | null;
  onClose: () => void;
};

export function ClientHistoryModal({ open, client, onClose }: Props) {
  if (!client) return null;

  const debt = calculateClientDebt(client);

  return (
    <Modal open={open} title={`Histórico - ${client.nome}`} onClose={onClose}>
      <div className="history-header">
        <div>
          <strong>Saldo atual</strong>
          <p>{formatCurrency(debt)}</p>
        </div>
        <div>
          <strong>Telefone</strong>
          <p>{client.telefone || 'Não informado'}</p>
        </div>
      </div>

      <div className="history-meta">
        <p><strong>Endereço:</strong> {client.endereco || 'Não informado'}</p>
        <p><strong>Referência:</strong> {client.referencia || 'Não informada'}</p>
      </div>

      <div className="history-list">
        {client.transactions.length === 0 ? (
          <div className="empty-state small">Nenhuma movimentação registrada ainda.</div>
        ) : (
          client.transactions.map((item) => (
            <div key={item.id} className="history-item">
              <div>
                <strong>{item.type === 'debt' ? 'Dívida' : 'Pagamento'}</strong>
                <p>{formatDate(item.createdAt)}</p>
              </div>
              <div>
                <strong>{formatCurrency(item.value)}</strong>
                <p>{item.note || 'Sem observação'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
