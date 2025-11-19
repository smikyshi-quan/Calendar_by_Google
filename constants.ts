import { EventCategory } from './types';
import { Briefcase, GraduationCap, User, Calendar as CalendarIcon } from 'lucide-react';

export const CATEGORY_COLORS = {
  [EventCategory.Business]: 'bg-blue-100 text-blue-700 border-blue-200',
  [EventCategory.Student]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [EventCategory.Personal]: 'bg-purple-100 text-purple-700 border-purple-200',
  [EventCategory.Other]: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const CATEGORY_ICONS = {
  [EventCategory.Business]: Briefcase,
  [EventCategory.Student]: GraduationCap,
  [EventCategory.Personal]: User,
  [EventCategory.Other]: CalendarIcon,
};

// Pre-defined color themes for user selection
export const EVENT_COLORS: Record<string, { label: string, classes: string, dot: string }> = {
  blue: { label: 'Blue', classes: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  emerald: { label: 'Green', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  purple: { label: 'Purple', classes: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  amber: { label: 'Orange', classes: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  rose: { label: 'Red', classes: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  cyan: { label: 'Cyan', classes: 'bg-cyan-100 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' },
};

export const AI_MODEL_NAME = 'gemini-2.5-flash';