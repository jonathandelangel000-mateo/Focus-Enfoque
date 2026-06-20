import { Note, Task, Habit, AgendaEvent, Expense, Quote } from './types';

export const INITIAL_QUOTES: Quote[] = [
  { id: 'q-1', text: "Cada movimiento da forma a tu futuro. Piensa. Planifica. Ejecuta. Sé imparable.", author: "Garry Kasparov" },
  { id: 'q-2', text: "La disciplina de hoy es la libertad de mañana. Sigue adelante.", author: "Autor Desconocido" },
  { id: 'q-3', text: "No encuentras la fuerza de voluntad, la creas con cada decisión pequeña.", author: "Jocko Willink" },
  { id: 'q-4', text: "La excelencia no es un acto singular, sino un hábito constante.", author: "Aristóteles" },
  { id: 'q-5', text: "El minimalismo no es la falta de cosas, sino la cantidad perfecta de ellas.", author: "The Minimalists" }
];

export const INITIAL_TASKS: Task[] = [
  { id: 't-1', title: "Estructurar flujo de captación de clientes", completed: true, priority: 'high', dueDate: '2026-06-20', createdAt: '2026-06-18' },
  { id: 't-2', title: "Diseñar interfaz oscura minimalist de la app", completed: true, priority: 'high', dueDate: '2026-06-19', createdAt: '2026-06-18' },
  { id: 't-3', title: "Revisar costes del servidor en la nube", completed: false, priority: 'medium', dueDate: '2026-06-21', createdAt: '2026-06-19' },
  { id: 't-4', title: "Actualizar repositorio Git de Focus", completed: false, priority: 'low', dueDate: '2026-06-22', createdAt: '2026-06-19' },
  { id: 't-5', title: "Practicar táctica de ajedrez (15 min)", completed: false, priority: 'low', dueDate: '2026-06-20', createdAt: '2026-06-20' }
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'h-1',
    name: "Meditación matutina",
    frequency: "Diario",
    completedDays: {
      '2026-06-14': true,
      '2026-06-15': true,
      '2026-06-16': false,
      '2026-06-17': true,
      '2026-06-18': true,
      '2026-06-19': true,
    },
    createdAt: '2026-06-10'
  },
  {
    id: 'h-2',
    name: "Sesión Deep Work (4 horas)",
    frequency: "Lunes a Viernes",
    completedDays: {
      '2026-06-14': false,
      '2026-06-15': true,
      '2026-06-16': true,
      '2026-06-17': true,
      '2026-06-18': false,
      '2026-06-19': true,
    },
    createdAt: '2026-06-10'
  },
  {
    id: 'h-3',
    name: "Desarrollo Personal (Lectura 30 min)",
    frequency: "Diario",
    completedDays: {
      '2026-06-14': true,
      '2026-06-15': true,
      '2026-06-16': true,
      '2026-06-17': true,
      '2026-06-18': true,
      '2026-06-19': false,
    },
    createdAt: '2026-06-10'
  },
  {
    id: 'h-4',
    name: "Entrenamiento de fuerza",
    frequency: "Lunes, Miércoles, Viernes",
    completedDays: {
      '2026-06-15': true,
      '2026-06-17': true,
      '2026-06-19': true,
    },
    createdAt: '2026-06-10'
  }
];

export const INITIAL_EVENTS: AgendaEvent[] = [
  { id: 'e-1', title: "Reunión de Lanzamiento Proyecto", date: '2026-06-20', time: '10:00', location: 'Google Meet', category: 'trabajo' },
  { id: 'e-2', title: "Sesión de Mentorship Focus", date: '2026-06-21', time: '16:30', location: 'Zoom', category: 'trabajo' },
  { id: 'e-3', title: "Examen de Certificación Cloud", date: '2026-06-23', time: '09:00', location: 'Centro Pearson', category: 'estudio' },
  { id: 'e-4', title: "Chequeo Médico Anual", date: '2026-06-25', time: '11:15', location: 'Hospital Ángeles', category: 'salud' }
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'ex-1', description: "Suscripción Copilot AI", amount: 200, category: "Productividad", date: "2026-06-15" },
  { id: 'ex-2', description: "Café de Especialidad grano", amount: 15.5, category: "Alimentación", date: "2026-06-18" },
  { id: 'ex-3', description: "Hosting de Servidores", amount: 45, category: "Servicios", date: "2026-06-19" },
  { id: 'ex-4', description: "Libro de Ajedrez Kasparov", amount: 28, category: "Educación", date: "2026-06-20" }
];

export const INITIAL_NOTES: Note[] = [
  { id: 'n-1', title: "Metas de Aprendizaje Q3", content: "1. Dominar mecánicas avanzadas en arquitecturas distribuidas.\n2. Completar 2 libros de economía aplicada.\n3. Mantener porcentaje de fidelidad en rutina arriba del 85%.", createdAt: "2026-06-18 14:32", category: "General" },
  { id: 'n-2', title: "Mindset Diario", content: "Pregúntate constantemente si lo que estás haciendo en este preciso segundo te acerca a la versión que quieres ser en 5 años. Si la respuesta es no, pivota inmediatamente.", createdAt: "2026-06-19 08:15", category: "Filosofía", isQuote: true },
  { id: 'n-3', title: "Ideas Focus Bird", content: "Implementar un canvas reactivo minimal con colores contrastantes y un multiplicador por racha para aumentar el enfoque cognitivo del usuario.", createdAt: "2026-06-19 22:11", category: "Proyectos" },
  { id: 'n-4', title: "Cita Inspiradora Marcus Aurelius", content: "Tienes poder sobre tu mente - no sobre los eventos externos. Date cuenta de esto, y encontrarás la fuerza suprema.", createdAt: "2026-06-20 07:00", category: "Filosofía", isQuote: true }
];
