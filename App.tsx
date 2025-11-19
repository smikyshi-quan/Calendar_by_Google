import React, { useState, useEffect } from 'react';
import {
  addMonths,
  addDays,
  addYears,
  format,
  differenceInMinutes,
  addMinutes,
  areIntervalsOverlapping
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, PanelRightOpen, PanelRightClose, LayoutDashboard } from 'lucide-react';
import { CalendarGrid } from './components/CalendarGrid';
import { AIAssistant } from './components/AIAssistant';
import { EventDetailsModal } from './components/EventDetailsModal';
import { EventFormModal } from './components/EventFormModal';
import { CalendarEvent, EventCategory, ViewMode } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const [selectedDateForCreation, setSelectedDateForCreation] = useState<Date | null>(null);

  // Utility to check for overlaps
  const checkOverlap = (start: Date, end: Date, excludeEventId?: string): boolean => {
    return events.some(event => {
      if (excludeEventId && event.id === excludeEventId) return false;
      return areIntervalsOverlapping(
        { start: new Date(event.start), end: new Date(event.end) },
        { start, end }
      );
    });
  };

  // Create or Update Logic
  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (editingEvent) {
      // Update existing
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...eventData } as CalendarEvent : e));
    } else {
      // Create new
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: eventData.title || 'Untitled',
        start: eventData.start!,
        end: eventData.end!,
        category: eventData.category || EventCategory.Personal,
        color: eventData.color, // Save the color
        description: eventData.description || '',
        location: eventData.location || '',
        source: 'user'
      };
      setEvents(prev => [...prev, newEvent]);
    }
    setIsFormOpen(false);
    setEditingEvent(undefined);
    setSelectedDateForCreation(null);
  };

  // Add multiple events from AI
  const handleAddAIEvents = (newEvents: CalendarEvent[]) => {
    setEvents(prev => [...prev, ...newEvents]);
    // Jump to first event date
    if (newEvents.length > 0) {
      setCurrentDate(new Date(newEvents[0].start));
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
  };

  const handleMoveEvent = (eventId: string, newDate: Date) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const oldStart = new Date(event.start);
        const oldEnd = new Date(event.end);
        const durationMinutes = differenceInMinutes(oldEnd, oldStart);

        // Create new start date with same time (for month view drag) or new time (for day view)
        const newStart = new Date(newDate);
        if (viewMode === ViewMode.Month) {
           newStart.setHours(oldStart.getHours(), oldStart.getMinutes());
        }
        
        const newEnd = addMinutes(newStart, durationMinutes);

        return {
          ...event,
          start: newStart.toISOString(),
          end: newEnd.toISOString()
        };
      }
      return event;
    }));
  };

  const openCreateModal = (date?: Date) => {
    setEditingEvent(undefined);
    setSelectedDateForCreation(date || currentDate);
    setIsFormOpen(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setSelectedEvent(null);
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  // Navigation Logic
  const navigateNext = () => {
    if (viewMode === ViewMode.Month) setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === ViewMode.Day) setCurrentDate(addDays(currentDate, 1));
    else if (viewMode === ViewMode.Year) setCurrentDate(addYears(currentDate, 1));
  };

  const navigatePrev = () => {
    if (viewMode === ViewMode.Month) setCurrentDate(addMonths(currentDate, -1));
    else if (viewMode === ViewMode.Day) setCurrentDate(addDays(currentDate, -1));
    else if (viewMode === ViewMode.Year) setCurrentDate(addYears(currentDate, -1));
  };

  const handleViewChange = (mode: ViewMode, date?: Date) => {
    setViewMode(mode);
    if (date) setCurrentDate(date);
  };

  const getHeaderText = () => {
    if (viewMode === ViewMode.Year) return format(currentDate, 'yyyy');
    if (viewMode === ViewMode.Month) return format(currentDate, 'MMMM yyyy');
    if (viewMode === ViewMode.Day) return format(currentDate, 'MMMM d, yyyy');
    return '';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-slate-900 font-sans overflow-hidden selection:bg-indigo-100 selection:text-indigo-900 relative">
      
      {/* Ambient Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content Area (Flex grow) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 z-10">
        
        {/* Glassy Header */}
        <header className="px-4 sm:px-6 py-4 bg-white/60 backdrop-blur-md border-b border-white/50 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-20 shadow-sm transition-all">
          
          {/* Logo & View Switcher Group */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setCurrentDate(new Date())}>
               <div className="relative">
                  <div className="absolute inset-0 bg-indigo-400 blur rounded-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 relative">
                      <LayoutDashboard className="w-5 h-5 text-white" />
                  </div>
               </div>
               <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                NexPlan
              </h1>
            </div>
            
            {/* Enhanced View Switcher */}
            <div className="flex bg-indigo-50/50 p-1 rounded-xl border border-indigo-100/50 shadow-inner">
              {Object.values(ViewMode).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${viewMode === mode ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5 scale-105' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          {/* Date Controls */}
          <div className="flex items-center bg-white/70 backdrop-blur-sm p-1 rounded-xl border border-white/60 shadow-sm">
            <button 
              onClick={navigatePrev} 
              className="p-2 hover:bg-indigo-50 rounded-lg text-slate-500 transition-all hover:text-indigo-600 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-sm font-bold text-slate-800 min-w-[140px] text-center select-none truncate">
              {getHeaderText()}
            </span>
            <button 
              onClick={navigateNext} 
              className="p-2 hover:bg-indigo-50 rounded-lg text-slate-500 transition-all hover:text-indigo-600 active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => openCreateModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 whitespace-nowrap border border-white/10"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Event</span>
            </button>
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2.5 rounded-xl transition-all border ml-1 shadow-sm ${isSidebarOpen ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white/80 text-slate-500 border-white/60 hover:bg-white'}`}
              title={isSidebarOpen ? "Close AI Assistant" : "Open AI Assistant"}
            >
              {isSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Calendar Grid Container */}
        <main className="flex-1 p-2 sm:p-4 overflow-hidden relative z-10">
          <div className="h-full w-full bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 overflow-hidden">
            <CalendarGrid 
              currentDate={currentDate}
              events={events}
              viewMode={viewMode}
              onSelectDate={(date) => openCreateModal(date)}
              onSelectEvent={setSelectedEvent}
              onMoveEvent={handleMoveEvent}
              onChangeView={handleViewChange}
            />
          </div>
        </main>
      </div>

      {/* Desktop Sidebar (Sibling in Flex) */}
      <div className={`
        hidden md:block
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-white/80 backdrop-blur-xl border-l border-white/50 z-20 shadow-xl
        ${isSidebarOpen ? 'w-80 lg:w-96 opacity-100' : 'w-0 opacity-0 overflow-hidden border-l-0'}
      `}>
        <div className="w-80 lg:w-96 h-full">
          <AIAssistant 
            onEventAdd={handleAddAIEvents} 
            currentDate={currentDate}
            checkConflict={checkOverlap}
          />
        </div>
      </div>

      {/* Mobile Sidebar (Overlay) */}
      <div className={`
        md:hidden fixed inset-0 z-50 bg-white/95 backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <AIAssistant 
          onEventAdd={handleAddAIEvents} 
          currentDate={currentDate}
          onClose={() => setIsSidebarOpen(false)}
          checkConflict={checkOverlap}
        />
      </div>

      {/* Modals */}
      <EventDetailsModal 
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={handleDeleteEvent}
        onEdit={openEditModal}
      />

      <EventFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveEvent}
        initialData={editingEvent}
        selectedDate={selectedDateForCreation}
        checkConflict={(start, end) => checkOverlap(start, end, editingEvent?.id)}
      />
    </div>
  );
};

export default App;