import { CreditCard, Users, Wallet } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

type Props = {
  totalClients: number;
  totalDebt: number;
  debtorsCount: number;
};

export function DashboardSummary({ totalClients, totalDebt, debtorsCount }: Props) {
  const items = [
    {
      label: 'Total de clientes',
      value: String(totalClients),
      icon: Users,
      helper: 'Cadastros ativos',
    },
    {
      label: 'Soma total das dívidas',
      value: formatCurrency(totalDebt),
      icon: Wallet,
      helper: 'Em aberto agora',
    },
    {
      label: 'Clientes devendo',
      value: String(debtorsCount),
      icon: CreditCard,
      helper: 'Com saldo acima de zero',
    },
  ];

  return (
    <section className="summary-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.label} className="summary-card">
            <div className="summary-card-top">
              <span>{item.label}</span>
              <Icon size={20} />
            </div>
            <strong>{item.value}</strong>
            <small>{item.helper}</small>
          </article>
        );
      })}
    </section>
  );
}
