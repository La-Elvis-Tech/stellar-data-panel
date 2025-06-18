
import React, { useState, useMemo } from 'react';
import { format, addWeeks, subWeeks, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WeeklyCalendarHeader from './WeeklyCalendarHeader';
import WeeklyCalendarByDoctor from './WeeklyCalendarByDoctor';
import { SupabaseAppointment } from '@/types/appointment';
import { Doctor } from '@/hooks/useDoctors';
import { useAuthContext } from '@/context/AuthContext';

interface EnhancedWeeklyCalendarProps {
  appointments: SupabaseAppointment[];
  doctors: Doctor[];
  units: Array<{ id: string; name: string; code: string }>;
  onSelectSlot?: (slotInfo: { 
    start: Date; 
    end: Date; 
    time?: string; 
    doctorId?: string; 
    doctorName?: string;
  }) => void;
}

const EnhancedWeeklyCalendar: React.FC<EnhancedWeeklyCalendarProps> = ({
  appointments,
  doctors,
  units,
  onSelectSlot
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('todas');
  const { isAdmin, isSupervisor } = useAuthContext();

  const handleNavigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }),
    end: endOfWeek(currentWeek, { weekStartsOn: 1 })
  });

  // Filtrar dados baseado na unidade selecionada
  const filteredData = useMemo(() => {
    if (selectedUnitFilter === 'todas') {
      return { doctors, appointments };
    }

    const filteredDoctors = doctors.filter(doctor => 
      doctor.unit_id === selectedUnitFilter
    );

    const filteredAppointments = appointments.filter(appointment => 
      appointment.unit_id === selectedUnitFilter
    );

    return { 
      doctors: filteredDoctors, 
      appointments: filteredAppointments 
    };
  }, [doctors, appointments, selectedUnitFilter]);

  const handleUnitFilterChange = (unitId: string) => {
    setSelectedUnitFilter(unitId);
  };

  return (
    <div className="space-y-4">
      <WeeklyCalendarHeader
        currentWeek={currentWeek}
        onNavigateWeek={handleNavigateWeek}
        units={units}
        selectedUnitFilter={selectedUnitFilter}
        onUnitFilterChange={handleUnitFilterChange}
        showUnitFilter={isAdmin() || isSupervisor()}
      />

      {selectedUnitFilter !== 'todas' && (
        <div className="text-sm text-neutral-600 dark:text-neutral-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
          Exibindo dados da unidade: <span className="font-semibold">
            {units.find(u => u.id === selectedUnitFilter)?.name || 'Unidade selecionada'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-7 gap-2 lg:gap-4">
        {weekDays.map((day) => (
          <WeeklyCalendarByDoctor
            key={day.toISOString()}
            day={day}
            appointments={filteredData.appointments}
            doctors={filteredData.doctors}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onSelectSlot={onSelectSlot}
          />
        ))}
      </div>

      {filteredData.doctors.length === 0 && selectedUnitFilter !== 'todas' && (
        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
          <p>Nenhum médico encontrado para a unidade selecionada.</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedWeeklyCalendar;
