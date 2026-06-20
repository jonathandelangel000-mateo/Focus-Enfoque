import { useState, FormEvent } from 'react';
import { Habit } from '../types';
import { Repeat, Plus, Trash2, Check, Calendar, TrendingUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RutinaViewProps {
  habits: Habit[];
  setHabits: (habits: Habit[] | ((prev: Habit[]) => Habit[])) => void;
  colorTema: string;
}

export default function RutinaView({ habits, setHabits, colorTema }: RutinaViewProps) {
  const [newHabitName, setNewHabitName] = useState('');
  const [newFrequency, setNewFrequency] = useState('Diario');

  const handleAddHabit = (e: FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: newHabitName.trim(),
      frequency: newFrequency,
      completedDays: {},
      createdAt: new Date().toISOString().split('T')[0]
    };

    setHabits(prev => [newHabit, ...prev]);
    setNewHabitName('');
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // Helper: get past 7 days date strings (YYYY-MM-DD)
  const getPast7Days = () => {
    const list = [];
    const daysName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      list.push({
        dateStr,
        label: daysName[d.getDay()],
        dayNum: d.getDate(),
        isToday: i === 0
      });
    }
    return list;
  };

  const daysList = getPast7Days();

  // Toggle habit completion on a specific date String (YYYY-MM-DD)
  const handleToggleHabitDay = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(hab => {
      if (hab.id !== habitId) return hab;
      const updated = { ...hab.completedDays };
      if (updated[dateStr] === true) {
        updated[dateStr] = false; // toggle off
      } else {
        updated[dateStr] = true; // toggle on
      }
      return {
        ...hab,
        completedDays: updated
      };
    }));
  };

  // Calculate generic completion rate across the week for each habit
  const getHabitCompletionRate = (completedDays: { [key: string]: boolean }) => {
    const totalDays = daysList.length;
    const completed = daysList.filter(d => completedDays[d.dateStr] === true).length;
    return Math.round((completed / totalDays) * 100);
  };

  // Calculate overall todays routine rate
  const todayStr = daysList[daysList.length - 1].dateStr;
  const completedToday = habits.filter(h => h.completedDays[todayStr] === true).length;
  const overallRateToday = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="border-b border-[#16161a] pb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#888892]">
          HABITUACIÓN Y AUTO-DISCIPLINA
        </span>
        <h2 className="font-sans font-light text-white text-3xl tracking-tight mt-1">
          Rutina y <span className="font-medium">Hábitos del Día</span>
        </h2>
      </div>

      {/* Hero card showing overall routine fidelity */}
      <div className="bg-gradient-to-r from-[#0a0a0f] to-[#040407] border border-[#16161c] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#00f2ff] flex items-center gap-1.5" style={{ color: colorTema }}>
            <Calendar size={11} /> DESEMPEÑO EN TIEMPO REAL
          </span>
          <h3 className="font-sans font-medium text-white text-xl">Fidelidad de hoy: {overallRateToday}%</h3>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
            Hacer clic en los casilleros de los días correspondientes te permitirá marcar tus hábitos. El Panel e Inicio actualizará inmediatamente sus gráficas de actividad diaria y semanal.
          </p>
        </div>

        {/* Circular tracker */}
        <div className="shrink-0 flex items-center gap-3 bg-[#111116] border border-[#1b1b24] p-4 rounded-xl">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-semibold bg-[#2a2a38]/40 border border-[#2a2a3c] text-[#00f2ff]" style={{ color: colorTema }}>
            {completedToday}/{habits.length}
          </div>
          <div>
            <span className="font-mono text-[9px] text-[gray-500] uppercase block">COMPLETADOS</span>
            <span className="font-sans font-medium text-xs text-white block">Hábitos activos</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Add Habit Panel (4 cols) */}
        <div className="lg:col-span-4 bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6 space-y-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
            <Plus size={12} className="text-[#00f2ff]" /> Instaurar Hábito
          </span>

          <form onSubmit={handleAddHabit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase">Nombre de la actividad</label>
              <input
                type="text"
                value={newHabitName}
                onChange={e => setNewHabitName(e.target.value)}
                placeholder="Ej. Hidratación 3L de agua..."
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase">Frecuencia recomendada</label>
              <select
                value={newFrequency}
                onChange={e => setNewFrequency(e.target.value)}
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-gray-500 transition-all font-mono"
              >
                <option value="Diario">🔄 DIARIO</option>
                <option value="Lunes a Viernes">☕ LUNES A VIERNES</option>
                <option value="Fines de Semana">🌴 FINES DE SEMANA</option>
                <option value="3 Veces por semana">⚡ 3 VECES POR SEMANA</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-black transition-all shadow-lg cursor-pointer"
              style={{ backgroundColor: colorTema }}
            >
              Instaurar e Iniciar
            </button>
          </form>

          <div className="pt-2">
            <span className="font-mono text-[9px] text-[#444455] leading-relaxed block uppercase">
              💡 Filosofía Focus: "No busques ser perfecto todos los días, busca mantener la constancia matemática de la física."
            </span>
          </div>
        </div>

        {/* Habits Checklist Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#888892] px-1 block mb-1">
            Matriz Temporal Completa (Últimos 7 días)
          </span>

          <div className="space-y-3.5">
            <AnimatePresence mode="popLayout">
              {habits.map(habit => {
                const globalRate = getHabitCompletionRate(habit.completedDays);
                
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#0a0a0f] border border-[#161622] rounded-2xl p-5 hover:border-gray-700 transition"
                  >
                    
                    {/* Upper title & info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#121217] pb-3 mb-4">
                      <div>
                        <h4 className="font-sans font-semibold text-white text-sm">
                          {habit.name}
                        </h4>
                        <span className="font-mono text-[9px] text-gray-500 uppercase mt-0.5 block">
                          Frecuencia: {habit.frequency}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-mono font-bold text-xs text-[#00f2ff]" style={{ color: colorTema }}>
                            {globalRate}%
                          </span>
                          <span className="font-mono text-[8px] text-gray-600 block uppercase">FIDELIDAD</span>
                        </div>

                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="text-gray-600 hover:text-red-500 p-1.5 rounded hover:bg-red-500/5 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Past 7 days checkoff grid circles */}
                    <div className="grid grid-cols-7 gap-3 text-center">
                      {daysList.map(day => {
                        const isDone = habit.completedDays[day.dateStr] === true;
                        
                        return (
                          <div key={day.dateStr} className="flex flex-col items-center gap-2">
                            {/* Short label */}
                            <span className="font-mono text-[9px] text-[#555562] font-semibold">
                              {day.label}
                            </span>
                            <span className="font-mono text-[8px] text-[#444452] -mt-1 block">
                              {day.dayNum}
                            </span>

                            {/* Check button */}
                            <button
                              onClick={() => handleToggleHabitDay(habit.id, day.dateStr)}
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                                isDone 
                                  ? 'bg-[#00f2ff] border-transparent text-black shadow-lg shadow-cyan-950/20' 
                                  : day.isToday 
                                    ? 'border-[#00f2ff]/30 text-transparent hover:border-[#00f2ff]' 
                                    : 'border-[#1b1b26] hover:border-gray-500 text-transparent'
                              }`}
                              style={{ 
                                backgroundColor: isDone ? colorTema : undefined,
                                borderColor: !isDone && day.isToday ? colorTema : undefined
                              }}
                            >
                              <Check size={14} strokeWidth={3} className={isDone ? 'block' : 'opacity-0 hover:opacity-20 hover:text-white'} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>

            {habits.length === 0 && (
              <div className="text-center py-16 bg-[#08080b]/60 rounded-2xl border border-dashed border-[#1a1a26]">
                <Repeat className="mx-auto text-gray-600 mb-3" size={32} />
                <p className="font-sans font-light text-sm text-gray-500 italic">
                  No tienes hábitos agregados. Agrega hábitos para comenzar la matriz de fidelidad.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
