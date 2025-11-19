import React, { useState, useRef } from 'react';
import { Loader2, Send, Sparkles, Bot, Info, AlertTriangle, ArrowLeft, Clock, Paperclip, X, Check, UploadCloud, GraduationCap } from 'lucide-react';
import { parseContentToEvents } from '../services/geminiService';
import { AIParseResult, CalendarEvent, EventCategory } from '../types';
import { CATEGORY_COLORS, EVENT_COLORS } from '../constants';

interface AIAssistantProps {
  onEventAdd: (events: CalendarEvent[]) => void;
  currentDate: Date;
  onClose?: () => void;
  checkConflict: (start: Date, end: Date) => boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onEventAdd, currentDate, onClose, checkConflict }) => {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{file: File, preview: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draftResult, setDraftResult] = useState<AIParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setSelectedFile({ file, preview });
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGoogleSync = () => {
    setIsSyncing(true);
    // Simulate API call
    setTimeout(() => {
        const today = new Date();
        const classroomEvents: CalendarEvent[] = [
            {
                id: crypto.randomUUID(),
                title: 'Calculus Assignment Due',
                start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 23, 59).toISOString(),
                end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 0, 0).toISOString(),
                category: EventCategory.Student,
                source: 'classroom',
                description: 'Chapter 5 problem set',
                color: 'emerald'
            },
            {
                id: crypto.randomUUID(),
                title: 'History Essay Draft',
                start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 17, 0).toISOString(),
                end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 18, 0).toISOString(),
                category: EventCategory.Student,
                source: 'classroom',
                description: 'Submit draft to Google Classroom',
                color: 'blue'
            }
        ];
        onEventAdd(classroomEvents);
        setIsSyncing(false);
        setHasSynced(true);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setDraftResult(null);

    try {
      let fileData = undefined;
      if (selectedFile) {
        const base64 = await convertFileToBase64(selectedFile.file);
        fileData = {
          mimeType: selectedFile.file.type,
          data: base64
        };
      }

      const result = await parseContentToEvents(input, currentDate, fileData);
      setDraftResult(result);
    } catch (err) {
      setError("Failed to process request. Please ensure the file is an image/PDF or try again.");
    } finally {
      setIsProcessing(false);
      clearFile();
    }
  };

  const confirmAllEvents = () => {
    if (draftResult?.events) {
      const newEvents: CalendarEvent[] = draftResult.events.map(e => ({
        id: crypto.randomUUID(),
        title: e.title || 'Untitled Event',
        start: e.start!,
        end: e.end!,
        description: e.description || '',
        location: e.location || '',
        category: e.category as EventCategory || EventCategory.Personal,
        color: e.color || 'blue', // Default color for AI events
        source: 'ai'
      }));
      onEventAdd(newEvents);
      setDraftResult(null);
      setInput('');
    }
  };

  const removeDraftEvent = (index: number) => {
    if (!draftResult) return;
    const newEvents = [...draftResult.events];
    newEvents.splice(index, 1);
    if (newEvents.length === 0) {
      setDraftResult(null);
    } else {
      setDraftResult({ ...draftResult, events: newEvents });
    }
  };

  const updateDraftEvent = (index: number, field: keyof CalendarEvent, value: any) => {
    if (!draftResult) return;
    const newEvents = [...draftResult.events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setDraftResult({ ...draftResult, events: newEvents });
  };

  const formatForInput = (isoString: string | undefined) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const offset = date.getTimezoneOffset() * 60000;
      const local = new Date(date.getTime() - offset);
      return local.toISOString().slice(0, 16);
    } catch (e) { return ''; }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm">
      {/* Decorative Header */}
      <div className="relative p-5 overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="relative z-10 flex items-center gap-3 text-white">
          {onClose && (
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
             <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight leading-tight">AI Scheduler</h2>
            <p className="text-xs text-indigo-100 font-medium opacity-90">
              Powered by Gemini 2.5
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-indigo-50/30 custom-scrollbar bg-dot-pattern">
        {!draftResult && !isProcessing && (
          <div className="flex flex-col items-center justify-start h-full pt-8 space-y-6">
             {/* Google Classroom Card */}
             {!hasSynced && (
                 <div className="w-full bg-white rounded-xl p-4 shadow-md border border-emerald-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm">Connect Classroom</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                            Import your deadlines and assignments directly from Google Classroom.
                        </p>
                        <button 
                            onClick={handleGoogleSync}
                            disabled={isSyncing}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                            {isSyncing ? "Syncing..." : "Connect Account"}
                        </button>
                    </div>
                 </div>
             )}

             {hasSynced && (
                 <div className="w-full bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                     <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                         <Check className="w-4 h-4" />
                     </div>
                     <div className="text-xs text-emerald-800">
                         <strong>Success!</strong> Your assignments have been added to the calendar.
                     </div>
                 </div>
             )}
            
            <div className="text-center opacity-70">
                <div className="relative mb-4 inline-block">
                <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center relative shadow-sm border border-indigo-50 mx-auto">
                    <Sparkles className="w-6 h-6 text-indigo-500" />
                </div>
                </div>
                <h3 className="text-slate-900 font-bold text-lg">Ready to plan</h3>
                <p className="text-sm text-slate-500 mt-2 px-4 leading-relaxed">
                I can help you manage your schedule. Try "Add a team meeting next Friday at 2pm" or upload a course syllabus.
                </p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse"></div>
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin relative z-10" />
            </div>
            <p className="text-sm font-bold text-slate-500 animate-pulse">
              {selectedFile ? "Scanning document..." : "Thinking..."}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm flex gap-3 items-start shadow-sm animate-in slide-in-from-bottom-2">
             <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
             {error}
          </div>
        )}

        {draftResult && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Judge's Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-indigo-100">
               <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-50">
                 <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1.5">
                   <Info className="w-3.5 h-3.5" /> AI Analysis
                 </span>
                 <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${draftResult.judgement.confidenceScore > 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                   {draftResult.judgement.confidenceScore}% Confidence
                 </div>
               </div>
               
               <p className="text-xs text-slate-600 italic mb-2">
                 "{draftResult.judgement.reasoning}"
               </p>

               {draftResult.judgement.ambiguityDetected && (
                 <div className="bg-amber-50 text-amber-800 px-3 py-2 rounded-lg text-xs flex gap-2 items-start border border-amber-100 mt-2">
                   <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                   <div>
                      <strong className="block mb-0.5">Clarification Needed</strong>
                      <p>{draftResult.judgement.suggestions?.[0]}</p>
                   </div>
                 </div>
               )}
            </div>
            
            <div className="flex items-center justify-between px-1">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                 Draft Events ({draftResult.events.length})
               </h3>
               <button onClick={confirmAllEvents} className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-full shadow-sm flex items-center gap-1 transition-colors">
                 <Check className="w-3 h-3" /> Add All
               </button>
            </div>

            {/* List of Editable Drafts */}
            <div className="space-y-3 pb-4">
              {draftResult.events.map((event, idx) => {
                 const isConflict = event.start && event.end && checkConflict(new Date(event.start), new Date(event.end));
                 const eventColor = event.color || 'blue';
                 const theme = EVENT_COLORS[eventColor];

                 return (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative group hover:shadow-md transition-shadow">
                    <button 
                      onClick={() => removeDraftEvent(idx)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className={`h-1.5 w-full ${theme ? theme.classes.split(' ')[0].replace('bg-', 'bg-') : 'bg-indigo-500'}`}></div>
                    
                    <div className="p-3 space-y-3">
                      {isConflict && (
                        <div className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded flex items-center gap-1 mb-1">
                           <AlertTriangle className="w-3 h-3" /> Overlap Detected
                        </div>
                      )}
                      
                      {/* Title */}
                      <input 
                        type="text"
                        value={event.title}
                        onChange={(e) => updateDraftEvent(idx, 'title', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 rounded-none text-sm font-bold text-slate-800 outline-none transition-colors"
                      />

                      {/* Date/Time */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative group/input">
                          <input 
                            type="datetime-local"
                            value={formatForInput(event.start)}
                            onChange={(e) => updateDraftEvent(idx, 'start', new Date(e.target.value).toISOString())}
                            className="w-full pl-6 pr-1 py-1.5 bg-slate-50 rounded-lg text-[10px] font-medium text-slate-700 border border-transparent focus:border-indigo-200 focus:bg-white transition-all outline-none"
                          />
                          <Clock className="w-3 h-3 text-slate-400 absolute left-2 top-2 group-focus-within/input:text-indigo-500" />
                        </div>
                         <div className="relative group/input">
                          <input 
                            type="datetime-local"
                            value={formatForInput(event.end)}
                            onChange={(e) => updateDraftEvent(idx, 'end', new Date(e.target.value).toISOString())}
                            className="w-full pl-6 pr-1 py-1.5 bg-slate-50 rounded-lg text-[10px] font-medium text-slate-700 border border-transparent focus:border-indigo-200 focus:bg-white transition-all outline-none"
                          />
                          <ArrowLeft className="w-3 h-3 text-slate-400 absolute left-2 top-2 rotate-180 group-focus-within/input:text-indigo-500" />
                        </div>
                      </div>

                      {/* Category */}
                      <div className="flex gap-1 overflow-x-auto scrollbar-hide pt-1 pb-1">
                        {Object.values(EventCategory).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => updateDraftEvent(idx, 'category', cat)}
                            className={`
                              px-2 py-1 rounded-md text-[9px] font-bold uppercase whitespace-nowrap border transition-all
                              ${event.category === cat 
                                ? CATEGORY_COLORS[cat] + ' shadow-sm scale-105'
                                : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50 hover:border-slate-200'}
                            `}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                 );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white/90 backdrop-blur-sm border-t border-slate-200 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        {/* File Preview */}
        {selectedFile && (
           <div className="flex items-center gap-2 mb-2 bg-indigo-50 px-3 py-2 rounded-lg text-xs text-indigo-700 border border-indigo-100 animate-in slide-in-from-bottom-2">
             <UploadCloud className="w-4 h-4" />
             <span className="truncate max-w-[180px] font-medium">{selectedFile.file.name}</span>
             <button onClick={clearFile} className="ml-auto p-1 hover:bg-indigo-100 rounded-full">
               <X className="w-3 h-3" />
             </button>
           </div>
        )}

        <form onSubmit={handleSubmit} className="relative group flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf"
            className="hidden"
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-xl border transition-all flex items-center justify-center ${selectedFile ? 'bg-indigo-100 text-indigo-600 border-indigo-200 shadow-inner' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-indigo-50 hover:text-indigo-500'}`}
            title="Upload Image/PDF"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedFile ? "Describe this file..." : "Ask Gemini to plan..."}
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium shadow-sm placeholder:text-slate-400 bg-slate-50 focus:bg-white"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || isProcessing}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center justify-center shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};