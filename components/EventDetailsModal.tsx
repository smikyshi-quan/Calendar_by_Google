import React from 'react';
import { X, Calendar, Clock, MapPin, AlignLeft, Trash2, Edit3 } from 'lucide-react';
import { CalendarEvent } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (event: CalendarEvent) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onDelete,
  onEdit
}) => {
  if (!isOpen || !event) return null;

  const Icon = CATEGORY_ICONS[event.category];
  const colorClass = CATEGORY_COLORS[event.category];

  const start = new Date(event.start);
  const end = new Date(event.end);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-r from-slate-100 to-white">
          <div className={`absolute -bottom-6 left-6 p-3 rounded-xl shadow-lg border-2 border-white ${colorClass.replace('border-', 'bg-')}`}>
            <Icon className="w-6 h-6" />
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="pt-10 px-6 pb-6">
          <div className="flex justify-between items-start mb-1">
             <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${colorClass}`}>
                {event.category}
             </span>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{event.title}</h2>

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Date</p>
                <p className="text-sm text-slate-500">
                  {start.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Time</p>
                <p className="text-sm text-slate-500">
                  {start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Location</p>
                  <p className="text-sm text-slate-500">{event.location}</p>
                </div>
              </div>
            )}

            {event.description && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                  <AlignLeft className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Description</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{event.description}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
             <button
              onClick={() => onDelete(event.id)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            <button
              onClick={() => onEdit(event)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" /> Edit Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};