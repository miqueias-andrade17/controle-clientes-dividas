import { useEffect, useState, type FormEvent } from 'react';
import type { Client, ClientFormValues } from '../types';
import { Modal } from './Modal';

type Props = {
  open: boolean;
  client?: Client | null;
  onClose: () => void;
  onSubmit: (values: ClientFormValues) => Promise<void>;
};

const initialValues: ClientFormValues = {
  nome: '',
  telefone: '',
  endereco: '',
  referencia: '',
};

export function ClientForm({ open, client, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<ClientFormValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(client);

  useEffect(() => {
    if (client) {
      setValues({
        nome: client.nome,
        telefone: client.telefone,
        endereco: client.endereco,
        referencia: client.referencia,
      });
      return;
    }

    setValues(initialValues);
  }, [client, open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!values.nome.trim()) {
      alert('O nome do cliente é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit(values);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={isEdit ? 'Editar cliente' : 'Adicionar cliente'} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Nome *
          <input
            value={values.nome}
            onChange={(event) => setValues((current) => ({ ...current, nome: event.target.value }))}
            placeholder="Nome do cliente"
          />
        </label>

        <label>
          Telefone
          <input
            value={values.telefone}
            onChange={(event) => setValues((current) => ({ ...current, telefone: event.target.value }))}
            placeholder="(99) 99999-9999"
          />
        </label>

        <label>
          Endereço
          <input
            value={values.endereco}
            onChange={(event) => setValues((current) => ({ ...current, endereco: event.target.value }))}
            placeholder="Rua, número, bairro"
          />
        </label>

        <label>
          Referência / observação
          <input
            value={values.referencia}
            onChange={(event) => setValues((current) => ({ ...current, referencia: event.target.value }))}
            placeholder="Vizinho do João, perto da praça..."
          />
        </label>

        <div className="form-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button primary" disabled={saving}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Cadastrar cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
