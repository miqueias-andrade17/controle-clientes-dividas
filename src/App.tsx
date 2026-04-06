import { LogOut, Moon, Plus, Search, Sun } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import './styles.css';
import { BackupActions } from './components/BackupActions';
import { ClientForm } from './components/ClientForm';
import { ClientHistoryModal } from './components/ClientHistoryModal';
import { ClientList } from './components/ClientList';
import { DashboardSummary } from './components/DashboardSummary';
import { ToastContainer } from './components/ToastContainer';
import { TransactionForm } from './components/TransactionForm';
import { useAuth } from './hooks/useAuth';
import { useClients } from './hooks/useClients';
import { useToast } from './hooks/useToast';
import { allowedEmail } from './lib/firebase';
import { calculateClientDebt, sortByDebtDesc } from './lib/utils';
import type { Client } from './types';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const { user, loading: authLoading, login, logout } = useAuth();
  const { clients, loading: clientsLoading, createClient, updateClient, removeClient, addTransaction, replaceAllClients } = useClients();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [onlyDebtors, setOnlyDebtors] = useState(false);
  const [sortDebt, setSortDebt] = useState(true);

  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [transactionClient, setTransactionClient] = useState<Client | null>(null);
  const [transactionType, setTransactionType] = useState<'debt' | 'payment'>('debt');

  const filteredClients = useMemo(() => {
    let result = clients.filter((client) =>
      client.nome.toLowerCase().includes(search.trim().toLowerCase()),
    );

    if (onlyDebtors) {
      result = result.filter((client) => calculateClientDebt(client) > 0);
    }

    if (sortDebt) {
  result = sortByDebtDesc(result);
}

    return result;
  }, [clients, onlyDebtors, search, sortDebt]);

  const summary = useMemo(() => {
    const totalDebt = clients.reduce((acc, client) => acc + calculateClientDebt(client), 0);
    const debtorsCount = clients.filter((client) => calculateClientDebt(client) > 0).length;

    return {
      totalClients: clients.length,
      totalDebt,
      debtorsCount,
    };
  }, [clients]);

  async function handleCreateOrUpdateClient(values: { nome: string; telefone: string; endereco: string; referencia: string }) {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, values);
        toast.success('Cliente atualizado com sucesso.');
      } else {
        await createClient(values);
        toast.success('Cliente cadastrado com sucesso.');
      }
      setEditingClient(null);
    } catch {
      toast.error('Não foi possível salvar o cliente.');
    }
  }

  async function handleDeleteClient(client: Client) {
    const confirmed = window.confirm(`Deseja excluir o cliente ${client.nome}?`);
    if (!confirmed) return;

    try {
      await removeClient(client.id);
      toast.success('Cliente excluído com sucesso.');
    } catch {
      toast.error('Não foi possível excluir o cliente.');
    }
  }

  async function handleTransaction(clientId: string, value: number, note: string) {
    try {
      await addTransaction(clientId, transactionType, value, note);
      toast.success(transactionType === 'debt' ? 'Dívida adicionada com sucesso.' : 'Pagamento registrado com sucesso.');
      setTransactionClient(null);
    } catch {
      toast.error('Não foi possível salvar a movimentação.');
    }
  }

  async function handleImport(clientsData: Client[]) {
    try {
      await replaceAllClients(clientsData);
      toast.success('Backup importado com sucesso.');
    } catch {
      toast.error('Falha ao importar backup.');
    }
  }

  if (authLoading) {
    return <div className="screen-center">Carregando autenticação...</div>;
  }

  if (!user) {
    return <LoginScreen onLogin={login} allowedEmail={allowedEmail} />;
  }

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <ToastContainer toasts={toast.toasts} />

      <header className="hero">
        <div>
          <span className="eyebrow">CADERNETA DIGITAL ONLINE</span>
          <h1>Gerenciamento de clientes e dívidas</h1>
          <p>Versão online para usar no comércio em vários computadores com o mesmo banco de dados.</p>
        </div>

        <div className="hero-actions">
          <button className="button secondary" type="button" onClick={() => setDarkMode((value) => !value)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? 'Modo claro' : 'Modo escuro'}
          </button>
          <button
            className="button primary"
            type="button"
            onClick={() => {
              setEditingClient(null);
              setClientFormOpen(true);
            }}
          >
            <Plus size={18} /> Adicionar cliente
          </button>
          <button className="button secondary" type="button" onClick={logout}>
            <LogOut size={18} /> Sair
          </button>
        </div>
      </header>

      <DashboardSummary {...summary} />

      <section className="panel filters-panel">
        <div className="search-wrap">
          <label>Buscar por nome</label>
          <div className="search-input">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Digite o nome do cliente"
            />
          </div>
        </div>

        <div className="filters-actions">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={onlyDebtors}
              onChange={(event) => setOnlyDebtors(event.target.checked)}
            />
            Somente clientes devendo
          </label>

          <button className="button secondary" type="button" onClick={() => setSortDebt((value) => !value)}>
            {sortDebt ? 'Ordenação por dívida: ativa' : 'Ordenação por dívida: desativada'}
          </button>

          <BackupActions clients={clients} onImport={handleImport} />
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <h2>Clientes</h2>
            <p>{filteredClients.length} cliente(s) exibido(s)</p>
          </div>
          {clientsLoading && <span>Sincronizando...</span>}
        </div>

        <ClientList
          clients={filteredClients}
          onViewHistory={setHistoryClient}
          onEdit={(client) => {
            setEditingClient(client);
            setClientFormOpen(true);
          }}
          onAddDebt={(client) => {
            setTransactionClient(client);
            setTransactionType('debt');
          }}
          onRegisterPayment={(client) => {
            setTransactionClient(client);
            setTransactionType('payment');
          }}
          onDelete={handleDeleteClient}
        />
      </section>

      <ClientForm
        open={clientFormOpen}
        client={editingClient}
        onClose={() => {
          setClientFormOpen(false);
          setEditingClient(null);
        }}
        onSubmit={handleCreateOrUpdateClient}
      />

      <TransactionForm
        open={Boolean(transactionClient)}
        client={transactionClient}
        type={transactionType}
        onClose={() => setTransactionClient(null)}
        onSubmit={handleTransaction}
      />

      <ClientHistoryModal
        open={Boolean(historyClient)}
        client={historyClient}
        onClose={() => setHistoryClient(null)}
      />
    </div>
  );
}

type LoginScreenProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  allowedEmail?: string;
};

function LoginScreen({ onLogin, allowedEmail }: LoginScreenProps) {
  const [email, setEmail] = useState(allowedEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch {
      setError('Falha no login. Verifique e-mail, senha e configuração do Firebase.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <span className="eyebrow">CADERNETA DIGITAL ONLINE</span>
        <h1>Entrar no sistema</h1>
        <p>Use o único usuário cadastrado no Firebase Authentication.</p>

        <label>
          E-mail
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seuemail@exemplo.com" />
        </label>

        <label>
          Senha
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
        </label>

        {error && <div className="error-box">{error}</div>}

        <button className="button primary full" type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default App;
