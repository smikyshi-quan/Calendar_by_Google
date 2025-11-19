export enum EventCategory {
  Business = 'Business',
  Student = 'Student',
  Personal = 'Personal',
  Other = 'Other'
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO String
  end: string; // ISO String
  description?: string;
  location?: string;
  category: EventCategory;
  source?: 'classroom' | 'user' | 'ai';
  color?: string; // Key for color theme (e.g. 'blue', 'red')
}

export interface AIJudgement {
  confidenceScore: number; // 0-100
  reasoning: string;
  ambiguityDetected: boolean;
  suggestions: string[];
}

export interface AIParseResult {
  events: Partial<CalendarEvent>[]; 
  judgement: AIJudgement;
}

export enum ViewMode {
  Year = 'Year',
  Month = 'Month',
  Day = 'Day'
}