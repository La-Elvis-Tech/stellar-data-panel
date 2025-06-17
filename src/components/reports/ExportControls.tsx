
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Database, FileSpreadsheet, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToJSON, exportToExcel, exportMultipleSheets } from '@/utils/exportUtils';

interface ExportControlsProps {
  data: any[];
  reportType: string;
  onExport?: (format: string, dataTypes: string[]) => void;
  additionalData?: { [key: string]: any[] };
}

const ExportControls: React.FC<ExportControlsProps> = ({ 
  data, 
  reportType, 
  onExport,
  additionalData = {} 
}) => {
  const [format, setFormat] = useState<'csv' | 'json' | 'excel'>('excel');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['appointments']);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '6months' | 'all'>('30days');
  const { toast } = useToast();

  const dataTypeOptions = [
    { id: 'appointments', label: 'Agendamentos', icon: Calendar, count: data.length },
    { id: 'inventory', label: 'Inventário', icon: Database, count: additionalData['Inventário']?.length || 0 },
    { id: 'movements', label: 'Movimentações', icon: FileText, count: additionalData['Movimentações']?.length || 0 },
    { id: 'alerts', label: 'Alertas', icon: FileText, count: additionalData['Alertas']?.length || 0 }
  ];

  const handleDataTypeToggle = (dataType: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataType) 
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    );
  };

  const filterDataByDateRange = (data: any[], dateField: string = 'created_at') => {
    if (dateRange === 'all') return data;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (dateRange) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
    }

    return data.filter(item => {
      const itemDate = new Date(item[dateField] || item.scheduled_date || item.created_at);
      return itemDate >= cutoffDate;
    });
  };

  const handleExport = () => {
    try {
      if (selectedDataTypes.length === 0) {
        toast({
          title: 'Erro na exportação',
          description: 'Selecione pelo menos um tipo de dado para exportar',
          variant: 'destructive',
        });
        return;
      }

      // If onExport prop is provided, use it (for custom export logic)
      if (onExport) {
        onExport(format, selectedDataTypes);
        return;
      }

      // Preparar dados para exportação
      const exportData: { [key: string]: any[] } = {};
      
      if (selectedDataTypes.includes('appointments')) {
        exportData['Agendamentos'] = filterDataByDateRange(data, 'scheduled_date').map(item => ({
          'Nome do Paciente': item.patient_name,
          'Email': item.patient_email,
          'Telefone': item.patient_phone,
          'Data do Agendamento': new Date(item.scheduled_date).toLocaleDateString('pt-BR'),
          'Status': item.status,
          'Custo': item.cost ? `R$ ${item.cost.toFixed(2)}` : 'N/A',
          'Tipo de Exame': item.exam_types?.name || 'N/A',
          'Médico': item.doctors?.name || 'N/A',
          'Unidade': item.units?.name || 'N/A',
          'Criado em': new Date(item.created_at).toLocaleDateString('pt-BR')
        }));
      }

      if (selectedDataTypes.includes('inventory') && additionalData['Inventário']) {
        exportData['Inventário'] = filterDataByDateRange(additionalData['Inventário']).map(item => ({
          'Nome': item.name,
          'Descrição': item.description || 'N/A',
          'Estoque Atual': item.current_stock,
          'Estoque Mínimo': item.min_stock,
          'Custo por Unidade': item.cost_per_unit ? `R$ ${item.cost_per_unit.toFixed(2)}` : 'N/A',
          'Unidade de Medida': item.unit_measure,
          'Categoria': item.inventory_categories?.name || 'N/A',
          'Fornecedor': item.supplier || 'N/A',
          'Data de Validade': item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('pt-BR') : 'N/A',
          'Ativo': item.active ? 'Sim' : 'Não'
        }));
      }

      if (selectedDataTypes.includes('movements') && additionalData['Movimentações']) {
        exportData['Movimentações'] = filterDataByDateRange(additionalData['Movimentações']).map(item => ({
          'Item': item.inventory_items?.name || 'N/A',
          'Tipo de Movimento': item.movement_type === 'in' ? 'Entrada' : 
                               item.movement_type === 'out' ? 'Saída' : 
                               item.movement_type === 'adjustment' ? 'Ajuste' : 'Transferência',
          'Quantidade': item.quantity,
          'Custo Total': item.total_cost ? `R$ ${item.total_cost.toFixed(2)}` : 'N/A',
          'Motivo': item.reason || 'N/A',
          'Categoria': item.inventory_items?.inventory_categories?.name || 'N/A',
          'Data': new Date(item.created_at).toLocaleDateString('pt-BR')
        }));
      }

      if (selectedDataTypes.includes('alerts') && additionalData['Alertas']) {
        exportData['Alertas'] = filterDataByDateRange(additionalData['Alertas']).map(item => ({
          'Título': item.title,
          'Tipo': item.alert_type,
          'Prioridade': item.priority,
          'Status': item.status,
          'Item': item.inventory_items?.name || 'N/A',
          'Valor Atual': item.current_value || 'N/A',
          'Valor Limite': item.threshold_value || 'N/A',
          'Data de Criação': new Date(item.created_at).toLocaleDateString('pt-BR')
        }));
      }

      // Gerar nome do arquivo
      const filename = `relatorio_${reportType}_${selectedDataTypes.join('_')}_${dateRange}_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'csv') {
        // Para CSV, exportar apenas o primeiro tipo de dado selecionado
        const firstDataType = Object.keys(exportData)[0];
        exportToCSV(exportData[firstDataType], filename);
      } else if (format === 'json') {
        exportToJSON(exportData, filename);
      } else if (format === 'excel') {
        // Para Excel, criar múltiplas abas
        const sheets = Object.entries(exportData).map(([name, data]) => ({
          data,
          name
        }));
        exportMultipleSheets(sheets, filename);
      }

      toast({
        title: 'Relatório exportado',
        description: `Dados exportados em formato ${format.toUpperCase()} (${selectedDataTypes.length} tipo(s) de dados)`,
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar o relatório',
        variant: 'destructive',
      });
    }
  };

  const getTotalRecords = () => {
    return selectedDataTypes.reduce((total, type) => {
      switch (type) {
        case 'appointments': return total + data.length;
        case 'inventory': return total + (additionalData['Inventário']?.length || 0);
        case 'movements': return total + (additionalData['Movimentações']?.length || 0);
        case 'alerts': return total + (additionalData['Alertas']?.length || 0);
        default: return total;
      }
    }, 0);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100">
            Configurações de Exportação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de tipos de dados */}
          <div>
            <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3 block">
              Tipos de dados para exportar:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {dataTypeOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option.id}
                    checked={selectedDataTypes.includes(option.id)}
                    onCheckedChange={() => handleDataTypeToggle(option.id)}
                  />
                  <label 
                    htmlFor={option.id}
                    className="text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-2"
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label} ({option.count} registros)
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Configurações de formato e período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2 block">
                Formato:
              </label>
              <Select value={format} onValueChange={(value: 'csv' | 'json' | 'excel') => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      CSV (Excel)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      JSON
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel (múltiplas abas)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2 block">
                Período:
              </label>
              <Select value={dateRange} onValueChange={(value: '7days' | '30days' | '6months' | 'all') => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="all">Todos os dados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resumo e botão de exportação */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Total de registros a exportar: <span className="font-semibold text-neutral-900 dark:text-neutral-100">{getTotalRecords()}</span>
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                  {selectedDataTypes.length} tipo(s) de dados selecionados
                </p>
              </div>
              <Button onClick={handleExport} disabled={selectedDataTypes.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportControls;
