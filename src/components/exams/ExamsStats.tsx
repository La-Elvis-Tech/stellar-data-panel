
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
      color: 'text-neutral-600 dark:text-neutral-400',
    },
    {
      title: "Exames Ativos",
      value: activeExams.toString(),
      icon: Activity,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: "Categorias",
      value: categories.toString(),
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: "Custo Médio",
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(avgCost),
      icon: TrendingUp,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <Card 
          key={index}
          className="border-0 bg-white/40 dark:bg-neutral-900/20 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neutral-50/80 dark:bg-neutral-800/40">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
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
