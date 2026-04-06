import type { ChangeEvent } from 'react';
import type { Client } from '../types';
import { downloadJson } from '../lib/utils';

type Props = {
  clients: Client[];
  onImport: (clients: Client[]) => Promise<void>;
};

export function BackupActions({ clients, onImport }: Props) {
  function handleExport() {
    const fileName = `backup-caderneta-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJson(fileName, clients);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text) as Client[];

      if (!Array.isArray(data)) {
        throw new Error('Arquivo inválido.');
      }

      const confirmed = window.confirm('Importar este backup vai substituir todos os dados atuais. Deseja continuar?');
      if (!confirmed) return;

      await onImport(data);
    } catch {
      alert('Não foi possível importar o arquivo JSON.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <div className="backup-actions">
      <button className="button secondary" type="button" onClick={handleExport}>
        Exportar JSON
      </button>
      <label className="button secondary file-button">
        Importar JSON
        <input type="file" accept="application/json" onChange={handleImport} hidden />
      </label>
    </div>
  );
}
