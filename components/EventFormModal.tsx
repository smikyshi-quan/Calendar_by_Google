import React, { useState, useEffect, useRef } from 'react';
import { X, Save, MapPin, AlignLeft, Clock, Calendar as CalendarIcon, ChevronDown, AlertTriangle, Check } from 'lucide-react';
import { CalendarEvent, EventCategory } from '../types';
import { CATEGORY_COLORS, EVENT_COLORS } from '../constants';
import { format, getHours, getMinutes } from 'date-fns';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Partial<CalendarEvent>) => void;
  initialData?: Partial<CalendarEvent>;
  selectedDate?: Date | null;
  checkConflict: (start: Date, end: Date) => boolean;
}

const FancyTimePicker = ({ date, onChange }: { date: Date, onChange: (d: Date) => void }) => {
    // Simplified version used previously, but since user requested "Simple", we stick to native input in the main render
    return null; 
};

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  selectedDate,
  checkConflict
}) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [category, setCategory] = useState<EventCategory>(EventCategory.Personal);
  const [color, setColor] = useState<string>('blue'); // Default color
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isConflict, setIsConflict] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setCategory(initialData.category || EventCategory.Personal);
        setColor(initialData.color || 'blue');
        setLocation(initialData.location || '');
        setDescription(initialData.description || '');
        setStartDate(initialData.start ? new Date(initialData.start) : new Date());
        setEndDate(initialData.end ? new Date(initialData.end) : new Date());
      } else if (selectedDate) {
        // New event from calendar click
        const s = new Date(selectedDate);
        if (s.getHours() === 0 && s.getMinutes() === 0) {
            const now = new Date();
            s.setHours(now.getHours() + 1, 0, 0, 0);
        }
        const e = new Date(s);
        e.setHours(s.getHours() + 1);

        setTitle('');
        setCategory(EventCategory.Personal);
        setColor('blue');
        setLocation('');
        setDescription('');
        setStartDate(s);
        setEndDate(e);
      } else {
        // Create generic
        const s = new Date();
        s.setMinutes(0, 0, 0);
        s.setHours(s.getHours() + 1);
        const e = new Date(s);
        e.setHours(s.getHours() + 1);
        
        setTitle('');
        setCategory(EventCategory.Personal);
        setColor('blue');
        setLocation('');
        setDescription('');
        setStartDate(s);
        setEndDate(e);
      }
    }
  }, [isOpen, initialData, selectedDate]);

  useEffect(() => {
    if (isOpen && startDate && endDate) {
      const conflict = checkConflict(startDate, endDate);
      setIsConflict(conflict);
    }
  }, [startDate, endDate, isOpen, checkConflict]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const submitData = {
      title,
      category,
      color,
      location,
      description,
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
    onSubmit(submitData);
    onClose();
  };

  // Handle date input change (native picker)
  const handleDatePartChange = (isStart: boolean, dateStr: string) => {
    if (!dateStr) return;
    const [y, m, d] = dateStr.split('-').map(Number);
    const newDatePart = new Date(y, m - 1, d);
    
    if (isStart) {
      const newS = new Date(startDate);
      newS.setFullYear(newDatePart.getFullYear(), newDatePart.getMonth(), newDatePart.getDate());
      setStartDate(newS);
      if (newS > endDate) {
        const newE = new Date(newS);
        newE.setHours(newS.getHours() + 1);
        setEndDate(newE);
      }
    } else {
      const newE = new Date(endDate);
      newE.setFullYear(newDatePart.getFullYear(), newDatePart.getMonth(), newDatePart.getDate());
      setEndDate(newE);
    }
  };

  // Handle time input change (native picker)
  const handleTimePartChange = (isStart: boolean, timeStr: string) => {
    if (!timeStr) return;
    const [h, m] = timeStr.split(':').map(Number);
    
    if (isStart) {
      const newS = new Date(startDate);
      newS.setHours(h, m);
      setStartDate(newS);
      if (newS > endDate) {
        const newE = new Date(newS);
        newE.setHours(h + 1, m);
        setEndDate(newE);
      }
    } else {
      const newE = new Date(endDate);
      newE.setHours(h, m);
      setEndDate(newE);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-indigo-50/50 flex justify-between items-center bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? 'Edit Event' : 'New Event'}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/80 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isConflict && (
           <div className="px-6 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2 text-red-700 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Warning: This event overlaps with another event.</span>
           </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Event Title</label>
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 font-semibold placeholder:text-slate-300 text-base bg-slate-50/30 focus:bg-white"
                placeholder="e.g., Team Standup"
              />
            </div>

            {/* Time Range - Simple Native Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Start
                </label>
                <div className="flex gap-2">
                   <input 
                      type="date"
                      required
                      value={format(startDate, 'yyyy-MM-dd')}
                      onChange={(e) => handleDatePartChange(true, e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-slate-700 font-medium bg-slate-50/30 focus:bg-white"
                   />
                   <input 
                      type="time"
                      required
                      value={format(startDate, 'HH:mm')}
                      onChange={(e) => handleTimePartChange(true, e.target.value)}
                      className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-slate-700 font-medium bg-slate-50/30 focus:bg-white"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> End
                </label>
                <div className="flex gap-2">
                   <input 
                      type="date"
                      required
                      value={format(endDate, 'yyyy-MM-dd')}
                      onChange={(e) => handleDatePartChange(false, e.target.value)}
                      min={format(startDate, 'yyyy-MM-dd')}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-slate-700 font-medium bg-slate-50/30 focus:bg-white"
                   />
                   <input 
                      type="time"
                      required
                      value={format(endDate, 'HH:mm')}
                      onChange={(e) => handleTimePartChange(false, e.target.value)}
                      className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-slate-700 font-medium bg-slate-50/30 focus:bg-white"
                   />
                </div>
              </div>
            </div>

            {/* Category & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(EventCategory).map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`
                            px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex-1 text-center
                            ${category === cat 
                                ? CATEGORY_COLORS[cat] + ' ring-2 ring-offset-1 ring-indigo-100 shadow-sm' 
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}
                            `}
                        >
                            {cat}
                        </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Color</label>
                    <div className="flex gap-3">
                        {Object.entries(EVENT_COLORS).map(([key, theme]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setColor(key)}
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110
                                    ${theme.dot} ${color === key ? 'ring-2 ring-offset-2 ring-slate-300 shadow-md' : 'opacity-70 hover:opacity-100'}
                                `}
                                title={theme.label}
                            >
                                {color === key && <Check className="w-4 h-4 text-white" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-300 bg-slate-50/30 focus:bg-white"
                placeholder="Add location (optional)"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <AlignLeft className="w-3 h-3" /> Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-300 resize-none bg-slate-50/30 focus:bg-white"
                placeholder="Add details..."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-indigo-50 bg-indigo-50/30 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-lg text-white text-sm font-semibold shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95
               ${isConflict ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-200'}
            `}
          >
            <Save className="w-4 h-4" />
            {isConflict ? 'Save Anyway' : 'Save Event'}
          </button>
        </div>
      </div>
    </div>
  );
};