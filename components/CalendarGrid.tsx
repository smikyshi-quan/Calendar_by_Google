import React from 'react';
import {
  format,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  eachMonthOfInterval,
  endOfYear,
  addHours,
  isWeekend
} from 'date-fns';
import { CalendarEvent, ViewMode } from '../types';
import { CATEGORY_COLORS, EVENT_COLORS } from '../constants';

// Helper functions to replace missing date-fns exports
const getStartOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getStartOfYear = (date: Date) => {
  return new Date(date.getFullYear(), 0, 1);
};

const getStartOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  viewMode: ViewMode;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onMoveEvent: (eventId: string, newDate: Date) => void;
  onChangeView: (mode: ViewMode, date?: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  events,
  viewMode,
  onSelectDate,
  onSelectEvent,
  onMoveEvent,
  onChangeView
}) => {
  
  // --- Drag & Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');
    if (eventId) {
      onMoveEvent(eventId, date);
    }
  };

  // Helper to get color classes
  const getEventColorClasses = (event: CalendarEvent) => {
    if (event.color && EVENT_COLORS[event.color]) {
      return EVENT_COLORS[event.color].classes;
    }
    return CATEGORY_COLORS[event.category];
  };

  // --- View Renderers ---

  const renderYearView = () => {
    const yearStart = getStartOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto h-full pb-10 custom-scrollbar px-2">
        {months.map((month, idx) => {
          const mStart = getStartOfMonth(month);
          const mEnd = endOfMonth(month);
          const days = eachDayOfInterval({ start: getStartOfWeek(mStart), end: endOfWeek(mEnd) });
          const isCurrentMonth = isSameMonth(month, new Date());
          
          // Soft color rotation for cards
          const colors = ['border-t-blue-400', 'border-t-indigo-400', 'border-t-purple-400', 'border-t-pink-400', 'border-t-emerald-400', 'border-t-teal-400'];
          const colorClass = colors[idx % colors.length];

          return (
            <div 
              key={month.toString()} 
              className={`
                bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-t-4 transition-all cursor-pointer group hover:-translate-y-1 duration-200
                ${colorClass}
                ${isCurrentMonth ? 'shadow-md shadow-indigo-100 ring-1 ring-indigo-50' : 'border-slate-100 hover:shadow-lg hover:bg-white/90'}
              `}
              onClick={() => onChangeView(ViewMode.Month, month)}
            >
              <h3 className={`text-sm font-bold mb-3 transition-colors ${isCurrentMonth ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                {format(month, 'MMMM')}
              </h3>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['S','M','T','W','T','F','S'].map(d => (
                  <span key={d} className="text-[10px] font-medium text-slate-400">{d}</span>
                ))}
                {days.map(day => {
                  const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));
                  const hasEvents = dayEvents.length > 0;
                  const isCurrentM = isSameMonth(day, month);
                  
                  return (
                    <div key={day.toISOString()} className="h-6 flex items-center justify-center relative">
                      <span className={`
                        text-[10px] w-5 h-5 flex items-center justify-center rounded-full
                        ${!isCurrentM ? 'text-slate-300 opacity-50' : isToday(day) ? 'bg-indigo-500 text-white font-bold shadow-sm' : 'text-slate-600'}
                      `}>
                        {format(day, 'd')}
                      </span>
                      {hasEvents && isCurrentM && !isToday(day) && (
                        <div className="absolute bottom-0.5 w-1 h-1 bg-indigo-300 rounded-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = getStartOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = getStartOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="flex flex-col h-full bg-slate-100 border border-slate-200 rounded-lg overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-7 bg-white border-b border-slate-200">
          {weekDays.map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days Grid - Using gap-px to create clear grid lines */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 flex-grow auto-rows-fr">
          {days.map((day) => {
            const dayEvents = events.filter(event => isSameDay(new Date(event.start), day));
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);
            const isWknd = isWeekend(day);
            
            return (
              <div
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                className={`
                  min-h-[100px] p-2 transition-all relative flex flex-col gap-1 group
                  ${isTodayDate ? 'bg-white' : isWknd ? 'bg-slate-50/80' : 'bg-white'}
                  ${!isCurrentMonth ? 'opacity-50 grayscale' : 'hover:bg-indigo-50/30 cursor-pointer'}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`
                    text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-all
                    ${isTodayDate ? 'bg-indigo-600 text-white shadow-md scale-110' : 'text-slate-700'}
                    ${!isCurrentMonth && !isTodayDate ? 'text-slate-400' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-1 overflow-y-auto max-h-[110px] custom-scrollbar z-10">
                  {dayEvents.slice(0, 4).map((event) => (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className={`
                        w-full text-left px-2 py-1 rounded text-[11px] font-semibold truncate border shadow-sm cursor-move
                        hover:brightness-95 active:scale-95 transition-all hover:shadow-md
                        ${getEventColorClasses(event)}
                      `}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 4 && (
                    <div className="text-[10px] text-slate-500 font-bold pl-1 hover:text-indigo-600 transition-colors">
                      + {dayEvents.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayStart = getStartOfDay(currentDate);

    return (
      <div className="flex flex-col h-full relative bg-white/30">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-[60px_1fr] border-b border-indigo-50 min-h-[60px] group">
              <div 
                className="text-xs font-medium text-slate-400 flex items-start justify-end pr-4 pt-2 border-r border-indigo-50/50 bg-gradient-to-b from-slate-50/50 to-white group-hover:from-indigo-50/30 transition-colors"
                onClick={() => onSelectDate(addHours(dayStart, hour))}
              >
                {format(new Date().setHours(hour), 'h a')}
              </div>
              <div 
                className="relative hover:bg-indigo-50/20 transition-colors cursor-pointer"
                onClick={() => onSelectDate(addHours(dayStart, hour))}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, addHours(dayStart, hour))}
              >
                {/* Events for this hour slot */}
                {events
                  .filter(e => isSameDay(new Date(e.start), currentDate))
                  .filter(e => new Date(e.start).getHours() === hour)
                  .map(event => (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className={`
                        absolute left-1 right-2 top-1 bottom-1 p-2 rounded-lg border shadow-sm cursor-move
                        hover:brightness-95 active:scale-95 transition-all z-10 hover:shadow-md
                        ${getEventColorClasses(event)}
                      `}
                    >
                       <div className="font-bold text-xs">{event.title}</div>
                       <div className="text-[10px] opacity-80">
                        {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                       </div>
                       {event.location && (
                         <div className="text-[10px] opacity-70 mt-1 truncate">{event.location}</div>
                       )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
          
          {/* Current Time Indicator (if today) */}
          {isToday(currentDate) && (
            <div 
              className="absolute left-0 right-0 border-t-2 border-red-400 z-20 pointer-events-none flex items-center shadow-sm opacity-80"
              style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 100}%` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 -ml-1.5 shadow-sm ring-2 ring-white"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      {viewMode === ViewMode.Year && renderYearView()}
      {viewMode === ViewMode.Month && renderMonthView()}
      {viewMode === ViewMode.Day && renderDayView()}
    </div>
  );
};