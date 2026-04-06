import { useState, type FormEvent } from 'react';
import type { Client, TransactionFormValues, TransactionType } from '../types';
import { Modal } from './Modal';

type Props = {
  open: boolean;
  client: Client | null;
  type: TransactionType;
  onClose: () => void;
  onSubmit: (clientId: string, value: number, note: string) => Promise<void>;
};

const initialValues: TransactionFormValues = {
  value: '',
  note: '',
};

export function TransactionForm({ open, client, type, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<TransactionFormValues>(initialValues);
  const [saving, setSaving] = useState(false);

  if (!client) return null;

  const title = type === 'debt' ? 'Adicionar dívida' : 'Registrar pagamento';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const numericValue = Number(values.value.replace(',', '.'));
    if (!numericValue || numericValue <= 0 || Number.isNaN(numericValue)) {
      alert('Informe um valor válido maior que zero.');
      return;
    }

    setSaving(true);
    try {
      if (!client) return;await onSubmit(client.id, numericValue, values.note);
      setValues(initialValues);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={`${title} - ${client.nome}`} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Valor *
          <input
            inputMode="decimal"
            value={values.value}
            onChange={(event) => setValues((current) => ({ ...current, value: event.target.value }))}
            placeholder="Ex: 25,50"
          />
        </label>

        <label>
          Observação
          <input
            value={values.note}
            onChange={(event) => setValues((current) => ({ ...current, note: event.target.value }))}
            placeholder="Ex: compra no balcão"
          />
        </label>

        <div className="form-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={`button ${type === 'debt' ? 'warning' : 'success'}`} disabled={saving}>
            {saving ? 'Salvando...' : title}
          </button>
        </div>
      </form>
    </Modal>
  );
}
