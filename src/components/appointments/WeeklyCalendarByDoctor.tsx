
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
  const isWeekend = getDay(day) === 0 || getDay(day) === 6;

  // Horários disponíveis baseados no dia da semana
  const getAvailableHours = () => {
    if (isWeekend) {
      return [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'
      ];
    } else {
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
    <div className="h-full flex flex-col space-y-3">
      {/* Lista de médicos e horários - layout compacto para horizontal */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {doctors.slice(0, 2).map((doctor) => {
          const doctorAppts = getDoctorAppointments(doctor.id);
          
          return (
            <div key={doctor.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 bg-neutral-50/50 dark:bg-neutral-800/50">
              {/* Cabeçalho do médico */}
              <div className="flex items-center gap-1 mb-2 pb-1 border-b border-neutral-200 dark:border-neutral-700">
                <User className="h-2.5 w-2.5 text-neutral-500 dark:text-neutral-400" />
                <div className="min-w-0 flex-1">
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
              <div className="grid grid-cols-1 gap-1">
                {availableHours.slice(0, 4).map((time) => {
                  const isTaken = isTimeSlotTaken(doctor.id, time);
                  const appointment = doctorAppts.find(appt => 
                    format(new Date(appt.scheduled_date), 'HH:mm') === time
                  );
                  
                  if (isTaken && appointment) {
                    return (
                      <div
                        key={time}
                        className={`text-xs p-1.5 rounded border cursor-pointer transition-all ${getStatusColor(appointment.status)}`}
                        title={`${appointment.patient_name} - ${appointment.exam_types?.name || 'Exame'}`}
                      >
                        <div className="font-semibold text-center">{time}</div>
                        <div className="truncate text-xs opacity-90 text-center">
                          {appointment.patient_name}
                        </div>
                      </div>
                    );
                  } else if (!isPast) {
                    return (
                      <Button
                        key={time}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs p-1 border-neutral-300 dark:border-neutral-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all"
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
              
              {doctorAppts.length > 4 && (
                <div className="text-xs text-center text-neutral-500 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-800 rounded-lg py-1 mt-1">
                  +{doctorAppts.length - 4} mais
                </div>
              )}
            </div>
          );
        })}
        
        {doctors.length > 2 && (
          <div className="text-xs text-center text-neutral-500 dark:text-neutral-400 font-medium bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-lg py-2 border border-neutral-200 dark:border-neutral-700">
            <User className="h-3 w-3 mx-auto mb-1" />
            +{doctors.length - 2} médicos
          </div>
        )}
        
        {doctors.length === 0 && (
          <div className="text-xs text-center text-neutral-400 dark:text-neutral-500 py-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600">
            <User className="h-4 w-4 mx-auto mb-1 opacity-50" />
            Nenhum médico
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyCalendarByDoctor;
