export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category: string;
  isQuote?: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  frequency: string; // e.g. 'Diario', 'Lunes-Viernes'
  completedDays: { [key: string]: boolean }; // YYYY-MM-DD
  createdAt: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location?: string;
  category: 'personal' | 'trabajo' | 'estudio' | 'salud';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
}

export interface Quote {
  id: string;
  text: string;
  author: string;
}
