
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Activity, Clock, TrendingUp } from 'lucide-react';

interface ExamsStatsProps {
  examTypes: any[];
}

const ExamsStats: React.FC<ExamsStatsProps> = ({ examTypes }) => {
  const totalExams = examTypes.length;
  const activeExams = examTypes.filter(exam => exam.active).length;
  const categories = [...new Set(examTypes.map(exam => exam.category))].length;
  const avgCost = examTypes.length > 0 
    ? examTypes.reduce((sum, exam) => sum + (exam.cost || 0), 0) / examTypes.length 
    : 0;

  const stats = [
    {
      title: "Total de Exames",
      value: totalExams.toString(),
      icon: Package,
      color: 'text-neutral-500',
      bgColor: 'bg-neutral-50 dark:bg-neutral-800/40',
    },
    {
      title: "Exames Ativos",
      value: activeExams.toString(),
      icon: Activity,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      title: "Categorias",
      value: categories.toString(),
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: "Custo Médio",
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(avgCost),
      icon: TrendingUp,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={index}
          className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  {stat.title}
                </p>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExamsStats;
