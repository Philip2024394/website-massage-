import React from 'react';
import { Clock, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';

interface DayHours {
  open: string;
  close: string;
  isClosed: boolean;
}

interface WeeklyHoursProps {
  weeklyHours: {
    monday: DayHours;
    tuesday: DayHours;
    wednesday: DayHours;
    thursday: DayHours;
    friday: DayHours;
    saturday: DayHours;
    sunday: DayHours;
  };
  onWeeklyHoursChange: (hours: any) => void;
  useWeeklySchedule: boolean;
  onToggleWeeklySchedule: (enabled: boolean) => void;
}

const WeeklyHours: React.FC<WeeklyHoursProps> = ({
  weeklyHours,
  onWeeklyHoursChange,
  useWeeklySchedule,
  onToggleWeeklySchedule
}) => {
  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const handleDayToggle = (day: keyof typeof weeklyHours) => {
    onWeeklyHoursChange({
      ...weeklyHours,
      [day]: {
        ...weeklyHours[day],
        isClosed: !weeklyHours[day].isClosed
      }
    });
  };

  const handleTimeChange = (day: keyof typeof weeklyHours, field: 'open' | 'close', value: string) => {
    onWeeklyHoursChange({
      ...weeklyHours,
      [day]: {
        ...weeklyHours[day],
        [field]: value
      }
    });
  };

  const copyToAllDays = (sourceDay: keyof typeof weeklyHours) => {
    const sourceHours = weeklyHours[sourceDay];
    const newWeeklyHours = { ...weeklyHours };
    
    Object.keys(newWeeklyHours).forEach((day) => {
      if (day !== sourceDay) {
        newWeeklyHours[day as keyof typeof weeklyHours] = {
          open: sourceHours.open,
          close: sourceHours.close,
          isClosed: sourceHours.isClosed
        };
      }
    });
    
    onWeeklyHoursChange(newWeeklyHours);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <Calendar className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Operating Hours</h3>
            <p className="text-sm text-gray-600">Set different hours for each day of the week</p>
          </div>
        </div>
        
        <button
          onClick={() => onToggleWeeklySchedule(!useWeeklySchedule)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            useWeeklySchedule
              ? 'bg-orange-100 text-orange-700 border border-orange-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          {useWeeklySchedule ? (
            <ToggleRight className="w-5 h-5 text-orange-600" />
          ) : (
            <ToggleLeft className="w-5 h-5 text-gray-400" />
          )}
          {useWeeklySchedule ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Weekly Schedule */}
      {useWeeklySchedule && (
        <div className="space-y-4">
          {Object.entries(dayNames).map(([dayKey, dayName]) => {
            const day = dayKey as keyof typeof weeklyHours;
            const hours = weeklyHours[day];
            
            return (
              <div key={day} className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                {/* Day Name */}
                <div className="w-24 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-900">{dayName}</span>
                </div>
                
                {/* Closed Toggle */}
                <button
                  onClick={() => handleDayToggle(day)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    hours.isClosed
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}
                >
                  {hours.isClosed ? 'Closed' : 'Open'}
                </button>
                
                {/* Time Inputs */}
                {!hours.isClosed && (
                  <>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <span className="text-gray-500 text-sm">to</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Copy to All Button */}
                    <button
                      onClick={() => copyToAllDays(day)}
                      className="px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      Copy to All
                    </button>
                  </>
                )}
              </div>
            );
          })}
          
          {/* Quick Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                const standardHours = { open: '09:00', close: '21:00', isClosed: false };
                const newWeeklyHours = { ...weeklyHours };
                Object.keys(newWeeklyHours).forEach((day) => {
                  newWeeklyHours[day as keyof typeof weeklyHours] = { ...standardHours };
                });
                onWeeklyHoursChange(newWeeklyHours);
              }}
              className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
            >
              Set All Days: 9 AM - 9 PM
            </button>
            
            <button
              onClick={() => {
                const newWeeklyHours = { ...weeklyHours };
                newWeeklyHours.sunday = { ...newWeeklyHours.sunday, isClosed: true };
                onWeeklyHoursChange(newWeeklyHours);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close Sundays
            </button>
          </div>
        </div>
      )}

      {/* Information */}
      {!useWeeklySchedule && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Weekly Schedule Disabled</h4>
          <p className="text-gray-600 text-sm mb-4">
            You're using a simple daily schedule. Enable weekly hours to set different times for each day.
          </p>
          <button
            onClick={() => onToggleWeeklySchedule(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Enable Weekly Schedule
          </button>
        </div>
      )}
    </div>
  );
};

export default WeeklyHours;