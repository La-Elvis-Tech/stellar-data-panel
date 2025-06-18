
import React from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WeeklyCalendarHeaderProps {
  currentWeek: Date;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  units?: Array<{ id: string; name: string; code: string }>;
  selectedUnitFilter?: string;
  onUnitFilterChange?: (unitId: string) => void;
  showUnitFilter?: boolean;
}

const WeeklyCalendarHeader: React.FC<WeeklyCalendarHeaderProps> = ({
  currentWeek,
  onNavigateWeek,
  units = [],
  selectedUnitFilter,
  onUnitFilterChange,
  showUnitFilter = false
}) => {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <div className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg hidden md:inline">
            <CalendarIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400 hidden md:inline" />
          </div>
          <div className="pr-2">
            <div className="text-base">Calendário Semanal</div>
            <div className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
              Selecione uma data para ver horários disponíveis
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateWeek('prev')}
            className="h-8 w-8 p-0 border-neutral-200 dark:border-neutral-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-xs md:text-sm font-medium sm:-mx-4 md:px-0 xl:px-4 text-neutral-700 dark:text-neutral-300 min-w-[140px] text-center">
            {format(weekStart, 'dd/MM', { locale: ptBR })} - {format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateWeek('next')}
            className="h-8 w-8 p-0 border-neutral-200 dark:border-neutral-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtro de Unidades */}
      {showUnitFilter && units.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <Filter className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Filtrar por unidade:
          </span>
          <Select value={selectedUnitFilter || 'todas'} onValueChange={onUnitFilterChange}>
            <SelectTrigger className="w-[200px] h-8 text-sm">
              <SelectValue placeholder="Todas as unidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as unidades</SelectItem>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name} ({unit.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedUnitFilter && selectedUnitFilter !== 'todas' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUnitFilterChange?.('todas')}
              className="h-6 px-2 text-xs"
            >
              Limpar
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendarHeader;
