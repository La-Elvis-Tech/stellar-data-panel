
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Calendar, Package, AlertTriangle } from 'lucide-react';

interface MetricsCardsProps {
  appointmentMetrics: any;
  inventoryMetrics: any;
  alertsCount: number;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({
  appointmentMetrics,
  inventoryMetrics,
  alertsCount
}) => {
  const cards = [
    {
      title: "Receita Total",
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(appointmentMetrics.revenue),
      subtitle: "Total de exames concluídos",
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50/80 dark:bg-emerald-900/20"
    },
    {
      title: "Agendamentos",
      value: appointmentMetrics.total.toString(),
      subtitle: `${appointmentMetrics.thisMonth} este mês`,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50/80 dark:bg-blue-900/20"
    },
    {
      title: "Itens em Estoque",
      value: inventoryMetrics.totalItems.toString(),
      subtitle: `${inventoryMetrics.lowStock} em estoque baixo`,
      icon: Package,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50/80 dark:bg-purple-900/20"
    },
    {
      title: "Alertas Ativos",
      value: alertsCount.toString(),
      subtitle: `${inventoryMetrics.expiringSoon} vencendo em 30 dias`,
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50/80 dark:bg-orange-900/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="border-0 bg-white/60 dark:bg-neutral-900/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  {card.title}
                </p>
                <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  {card.value}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {card.subtitle}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsCards;
