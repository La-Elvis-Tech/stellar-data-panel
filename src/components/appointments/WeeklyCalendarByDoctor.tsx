
import React, { useState, useEffect } from 'react';
import { format, isSameDay, isToday, isAfter, startOfToday, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SupabaseAppointment } from '@/types/appointment';
import { Doctor } from '@/hooks/useDoctors';
import { Button } from '@/components/ui/button';
import { Clock, User } from 'lucide-react';

interface WeeklyCalendarByDoctorProps {
  day: Date;
  appointments: SupabaseAppointment[];
  doctors: Doctor[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onSelectSlot?: (slotInfo: { 
    start: Date; 
    end: Date; 
    time?: string; 
    doctorId?: string; 
    doctorName?: string;
  }) => void;
}

const WeeklyCalendarByDoctor: React.FC<WeeklyCalendarByDoctorProps> = ({
  day,
  appointments,
  doctors,
  selectedDate,
  onSelectDate,
  onSelectSlot
}) => {
  const isSelected = selectedDate && isSameDay(day, selectedDate);
  const isPast = !isAfter(day, startOfToday()) && !isToday(day);
  const isWeekend = getDay(day) === 0 || getDay(day) === 6; // 0 = domingo, 6 = sábado

  // Horários disponíveis baseados no dia da semana
  const getAvailableHours = () => {
    if (isWeekend) {
      // Fins de semana: 8:00 às 14:00
      return [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'
      ];
    } else {
      // Dias úteis: 7:00 às 17:30
      return [
        '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
        '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
      ];
    }
  };

  const availableHours = getAvailableHours();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado': 
      case 'Confirmado': 
        return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600';
      case 'Em andamento': 
        return 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600';
      case 'Concluído': 
        return 'bg-green-500 hover:bg-green-600 text-white border-green-600';
      case 'Cancelado': 
        return 'bg-gray-400 hover:bg-gray-500 text-white border-gray-500';
      default: 
        return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600';
    }
  };

  const getDoctorAppointments = (doctorId: string) => {
    return appointments.filter(appointment => 
      appointment.doctor_id === doctorId && isSameDay(new Date(appointment.scheduled_date), day)
    );
  };

  const isTimeSlotTaken = (doctorId: string, time: string) => {
    const doctorAppts = getDoctorAppointments(doctorId);
    return doctorAppts.some(appt => {
      const apptTime = format(new Date(appt.scheduled_date), 'HH:mm');
      return apptTime === time;
    });
  };

  const handleTimeSlotClick = (doctorId: string, doctorName: string, time: string) => {
    if (isPast || isTimeSlotTaken(doctorId, time)) return;

    const [hour, minute] = time.split(':').map(Number);
    const startTime = new Date(day);
    startTime.setHours(hour, minute, 0, 0);
    
    const endTime = new Date(startTime.getTime() + (30 * 60000));

    onSelectSlot?.({
      start: startTime,
      end: endTime,
      time,
      doctorId,
      doctorName
    });
  };

  return (
    <div
      className={`
        p-3 rounded-xl cursor-pointer transition-all duration-200 min-h-[500px] border-2
        ${isSelected 
          ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-600 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800' 
          : 'bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800 shadow-sm'
        }
        ${isPast ? 'opacity-50' : ''}
        ${isToday(day) ? 'ring-2 ring-indigo-300 dark:ring-indigo-700' : ''}
      `}
      onClick={() => !isPast && onSelectDate(day)}
    >
      {/* Cabeçalho do dia aprimorado */}
      <div className="text-center mb-4 border-b border-neutral-200 dark:border-neutral-700 pb-3">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
          <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase font-medium tracking-wide">
            {format(day, 'EEE', { locale: ptBR })}
          </div>
        </div>
        <div className={`text-xl font-bold ${
          isToday(day) 
            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-8 h-8 flex items-center justify-center mx-auto' 
            : isSelected
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-neutral-900 dark:text-neutral-100'
        }`}>
          {format(day, 'd')}
        </div>
        {isWeekend && (
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full mt-1">
            Horário Reduzido
          </div>
        )}
        <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          {format(day, 'dd/MM', { locale: ptBR })}
        </div>
      </div>
      
      {/* Subdivisões por médico aprimoradas */}
      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600">
        {doctors.slice(0, 3).map((doctor) => {
          const doctorAppts = getDoctorAppointments(doctor.id);
          
          return (
            <div key={doctor.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 bg-neutral-50/50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-700">
                <User className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
                <div>
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                    Dr. {doctor.name}
                  </div>
                  {doctor.specialty && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {doctor.specialty}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Primeiros horários do médico */}
              <div className="grid grid-cols-2 gap-1">
                {availableHours.slice(0, 6).map((time) => {
                  const isTaken = isTimeSlotTaken(doctor.id, time);
                  const appointment = doctorAppts.find(appt => 
                    format(new Date(appt.scheduled_date), 'HH:mm') === time
                  );
                  
                  if (isTaken && appointment) {
                    return (
                      <div
                        key={time}
                        className={`text-xs p-2 rounded border-2 cursor-pointer transition-all ${getStatusColor(appointment.status)}`}
                        title={`${appointment.patient_name} - ${appointment.exam_types?.name || 'Exame'}`}
                      >
                        <div className="font-semibold text-center">{time}</div>
                        <div className="truncate text-xs opacity-90 text-center">
                          {appointment.patient_name}
                        </div>
                        {appointment.exam_types?.name && (
                          <div className="truncate text-xs opacity-75 text-center mt-1 bg-white/20 rounded px-1">
                            {appointment.exam_types.name}
                          </div>
                        )}
                      </div>
                    );
                  } else if (!isPast) {
                    return (
                      <Button
                        key={time}
                        variant="outline"
                        size="sm"
                        className="h-12 text-xs p-1 border-neutral-300 dark:border-neutral-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTimeSlotClick(doctor.id, doctor.name, time);
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="font-medium">{time}</div>
                          <div className="text-xs opacity-75">Livre</div>
                        </div>
                      </Button>
                    );
                  }
                  
                  return null;
                })}
              </div>
              
              {doctorAppts.length > 6 && (
                <div className="text-xs text-center text-neutral-500 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-800 rounded-lg py-2 mt-2">
                  +{doctorAppts.length - 6} agendamentos
                </div>
              )}
            </div>
          );
        })}
        
        {doctors.length > 3 && (
          <div className="text-xs text-center text-neutral-500 dark:text-neutral-400 font-medium bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-lg py-3 border border-neutral-200 dark:border-neutral-700">
            <User className="h-4 w-4 mx-auto mb-1" />
            +{doctors.length - 3} médicos disponíveis
          </div>
        )}
        
        {doctors.length === 0 && (
          <div className="text-xs text-center text-neutral-400 dark:text-neutral-500 py-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600">
            <User className="h-6 w-6 mx-auto mb-2 opacity-50" />
            Nenhum médico disponível
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyCalendarByDoctor;
