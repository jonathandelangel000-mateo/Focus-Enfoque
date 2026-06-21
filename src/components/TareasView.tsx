import { useState, FormEvent } from 'react';
import { Task } from '../types';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CalendarDays, 
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TareasViewProps {
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  colorTema: string;
  addNotification?: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function TareasView({ tasks, setTasks, colorTema, addNotification }: TareasViewProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
      priority: newPriority,
      dueDate: newDueDate || undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTasks(prev => [newTask, ...prev]);
    if (addNotification) {
      addNotification(
        'Tarea Registrada 📝', 
        `Se añadió la tarea: "${newTask.title}"${newTask.priority === 'high' ? ' (Prioridad Alta - Crítico)' : ''}`, 
        newTask.priority === 'high' ? 'warning' : 'success'
      );
    }
    setNewTitle('');
    setNewDueDate('');
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    
    if (addNotification) {
      if (!task.completed) {
        addNotification(
          '¡Buen trabajo! 🎉', 
          `Has marcado como completada la tarea: "${task.title}"`, 
          'success'
        );
      } else {
        addNotification(
          'Tarea Reactivada ↩️', 
          `Se marcó pendiente la tarea: "${task.title}"`, 
          'info'
        );
      }
    }
  };

  const handleDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (task && addNotification) {
      addNotification('Tarea Eliminada 🗑️', `Se eliminó la tarea: "${task.title}"`, 'info');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed') return t.completed;
    if (filter === 'pending') return !t.completed;
    return !t.completed; // Hide completed tasks from 'all' view too
  });

  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = totalTasks - completedCount;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="border-b border-[#16161a] pb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#888892]">
          EFICIENCIA Y MÉTRICAS
        </span>
        <h2 className="font-sans font-light text-white text-3xl tracking-tight mt-1">
          Tareas y <span className="font-medium">Recordatorios</span>
        </h2>
      </div>

      {/* Stats row & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-[#0c0c11] border border-[#1a1a24] rounded-xl p-5 text-center">
          <p className="font-mono text-[10px] text-gray-500 uppercase">Totales registradas</p>
          <p className="font-sans font-bold text-2xl text-white mt-1">{totalTasks}</p>
        </div>

        <div className="bg-[#0c0c11] border border-[#1a1a24] rounded-xl p-5 text-center">
          <p className="font-mono text-[10px] text-gray-500 uppercase">Completadas</p>
          <p className="font-sans font-bold text-2xl text-emerald-500 mt-1">{completedCount}</p>
        </div>

        <div className="bg-[#0c0c11] border border-[#1a1a24] rounded-xl p-5 text-center">
          <p className="font-mono text-[10px] text-gray-500 uppercase">Pendientes urgentes</p>
          <p className="font-sans font-bold text-2xl text-amber-500 mt-1">{pendingCount}</p>
        </div>

        {/* Filter selection buttons */}
        <div className="bg-[#0c0c11] border border-[#1a1a24] rounded-xl p-3 flex flex-col justify-center gap-1.5">
          <p className="font-mono text-[9px] text-gray-500 uppercase px-2 mb-1">Filtrar lista</p>
          <div className="grid grid-cols-3 gap-1">
            {(['all', 'pending', 'completed'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`text-[10px] py-1.5 rounded-lg font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  filter === type 
                    ? 'bg-white text-black font-semibold' 
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                {type === 'all' ? 'Todo' : type === 'pending' ? 'Pend' : 'Hech'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Content: Add form & Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Add task form (4 cols) */}
        <div className="lg:col-span-4 bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6 space-y-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
            <Plus size={12} className="text-[#00f2ff]" /> Nueva Tarea
          </span>
          
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase">¿Qué necesitas consolidar?</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ej. Diseñar prototipo Kanban..."
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase">Nivel de prioridad</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map(priority => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setNewPriority(priority)}
                    className={`font-mono text-[10px] py-2 rounded-xl uppercase transition-all border cursor-pointer ${
                      newPriority === priority 
                        ? 'border-white bg-[#1a1a24] text-white font-semibold' 
                        : 'border-[#1b1b22] bg-[#111116]/40 text-gray-400 hover:text-white'
                    }`}
                  >
                    {priority === 'low' ? 'Baja' : priority === 'medium' ? 'Media' : 'Alta'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase flex items-center gap-1.5">
                <CalendarDays size={11} /> Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-gray-500 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-black transition-all shadow-lg hover:shadow-cyan-900/30 cursor-pointer"
              style={{ backgroundColor: colorTema }}
            >
              Consolidar Tarea
            </button>
          </form>
        </div>

        {/* Right column: Task display list (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#888892] px-1 block mb-2">
            Resultados de Búsqueda ({filteredTasks.length})
          </span>

          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map(task => {
                const isHigh = task.priority === 'high';
                const isMed = task.priority === 'medium';
                const priorityColor = isHigh 
                  ? 'text-red-500 border-red-500/20 bg-red-500/5' 
                  : isMed 
                    ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' 
                    : 'text-gray-400 border-[#23232c] bg-[#111116]/40';

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`group flex items-center justify-between p-4 bg-[#0a0a0f] border border-[#161622] rounded-xl hover:border-gray-700 transition ${
                      task.completed ? 'opacity-65' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                      {/* Interactive check bubble */}
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                          task.completed 
                            ? 'bg-[#00f2ff] border-transparent text-black' 
                            : 'border-[#2c2c3b] hover:border-white text-transparent'
                        }`}
                        style={{ backgroundColor: task.completed ? colorTema : undefined }}
                      >
                        <Check size={14} strokeWidth={3} className="shrink-0" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <p 
                          className={`font-sans text-sm text-white tracking-wide transition-all ${
                            task.completed ? 'line-through text-gray-500' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`font-mono text-[8px] uppercase tracking-wider py-0.5 px-1.5 rounded-md border ${priorityColor}`}>
                            Prio {task.priority === 'low' ? 'Baja' : task.priority === 'medium' ? 'Media' : 'Alta'}
                          </span>
                          {task.dueDate && (
                            <span className="font-mono text-[9px] text-[#888892] flex items-center gap-1">
                              📅 Vence: {task.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete button (displays on hover) */}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-[#444455] hover:text-red-500 p-2 rounded-lg hover:bg-red-500/5 transition cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 bg-[#09090c]/50 rounded-2xl border border-dashed border-[#181822]">
                <CheckSquare className="mx-auto text-gray-600 mb-3" size={32} />
                <p className="font-sans font-light text-sm text-gray-500 italic">
                  No se encontraron tareas en esta sección.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
