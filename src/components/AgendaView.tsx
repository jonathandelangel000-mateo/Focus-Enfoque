import { useState, FormEvent } from 'react';
import { AgendaEvent } from '../types';
import { Calendar, Plus, Trash2, Clock, MapPin, Tag, Filter, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AgendaViewProps {
  events: AgendaEvent[];
  setEvents: (events: AgendaEvent[] | ((prev: AgendaEvent[]) => AgendaEvent[])) => void;
  colorTema: string;
  addNotification?: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function AgendaView({ events, setEvents, colorTema, addNotification }: AgendaViewProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState<'personal' | 'trabajo' | 'estudio' | 'salud'>('trabajo');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleAddEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate || !newTime) return;

    const newEvent: AgendaEvent = {
      id: `event-${Date.now()}`,
      title: newTitle.trim(),
      date: newDate,
      time: newTime,
      location: newLocation.trim() || undefined,
      category: newCategory
    };

    setEvents(prev => [...prev, newEvent].sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)));
    
    if (addNotification) {
      addNotification(
        'Compromiso Agendado 💼', 
        `Nuevo evento: "${newEvent.title}" programado para el ${newEvent.date} a las ${newEvent.time} hrs.`, 
        'info'
      );
    }

    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewLocation('');
  };

  const handleDeleteEvent = (id: string) => {
    const event = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    if (event && addNotification) {
      addNotification('Evento Cancelado 🗑️', `Se retiró de la agenda: "${event.title}"`, 'info');
    }
  };

  const handleToggleEvent = (id: string) => {
    const event = events.find(e => e.id === id);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
    if (event && addNotification) {
      if (!event.completed) {
        addNotification('Evento Completado ✓', `Asistencia/compromiso concluido: "${event.title}"`, 'success');
      } else {
        addNotification('Evento Reactivado ↩️', `Se marcó pendiente: "${event.title}"`, 'info');
      }
    }
  };

  const filteredEvents = events.filter(ev => {
    if (filterCategory === 'all') return true;
    return ev.category === filterCategory;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'trabajo': return 'text-[#00f2ff] bg-[#00f2ff]/5 border-[#00f2ff]/20';
      case 'estudio': return 'text-[#a855f7] bg-[#a855f7]/5 border-[#a855f7]/20';
      case 'salud': return 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20';
      default: return 'text-gray-400 bg-gray-500/5 border-gray-600/20';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="border-b border-[#16161a] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#888892]">
            EJE CRONOLÓGICO Y TIEMPO
          </span>
          <h2 className="font-sans font-light text-white text-3xl tracking-tight mt-1">
            Agenda de <span className="font-medium">Compromisos</span>
          </h2>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-[#0c0c11]/80 border border-[#1d1d26] rounded-xl px-3 py-1.5 self-start">
          <Filter size={14} className="text-gray-500" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-transparent text-xs text-gray-300 font-mono focus:outline-none cursor-pointer uppercase tracking-wider"
          >
            <option value="all">Todas las categorías</option>
            <option value="trabajo">Trabajo</option>
            <option value="estudio">Estudios</option>
            <option value="salud">Salud</option>
            <option value="personal">Personal</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left col: Add event (4 cols) */}
        <div className="lg:col-span-4 bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6 space-y-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
            <Plus size={12} className="text-[#00f2ff]" /> Planificar Evento
          </span>

          <form onSubmit={handleAddEvent} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase">Título del Compromiso</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ej. Entregar reporte ejecutivo..."
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] text-gray-400 uppercase">Fecha</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-gray-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] text-gray-400 uppercase">Hora de inicio</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-gray-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase">Ubicación / Sala virtual</label>
              <input
                type="text"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                placeholder="Ej. Google Meet o Sala de juntas B..."
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase">Clasificación</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-gray-500 transition-all font-mono"
              >
                <option value="trabajo">💼 TRABAJO</option>
                <option value="estudio">📚 ESTUDIO / ACADÉMICO</option>
                <option value="salud">🩺 SALUD / BIENESTAR</option>
                <option value="personal">☕ PERSONAL / SOCIAL</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-black transition-all shadow-lg cursor-pointer"
              style={{ backgroundColor: colorTema }}
            >
              Agendar Actividad
            </button>
          </form>
        </div>

        {/* Right col: Timeline list (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#888892] px-1 block mb-1">
            Compromisos en Agenda ({filteredEvents.length})
          </span>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((ev, index) => {
                const catStyle = getCategoryColor(ev.category);
                return (
                  <motion.div
                    key={ev.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-4 group"
                  >
                    {/* Visual left timeline tracker bullet */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#00f2ff] border border-black group-hover:scale-125 transition" style={{ backgroundColor: colorTema }} />
                      <div className="w-0.5 bg-[#171725] flex-1 my-1" />
                    </div>

                    <div className="flex-1 bg-[#0a0a0f] border border-[#161622] rounded-2xl p-5 hover:border-gray-700 transition flex items-center justify-between">
                      <div className="space-y-2 flex-1 pr-4 min-w-0">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleEvent(ev.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              ev.completed 
                                ? 'bg-[#00f2ff] border-transparent text-black' 
                                : 'border-gray-800 text-transparent hover:border-gray-500'
                            }`}
                            style={{
                              backgroundColor: ev.completed ? colorTema : undefined
                            }}
                          >
                            <Check size={11} strokeWidth={3} className={ev.completed ? 'block' : 'opacity-0'} />
                          </button>
                          <h4 className={`font-sans font-semibold text-sm truncate ${ev.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                            {ev.title}
                          </h4>
                          <span className={`font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${catStyle}`}>
                            {ev.category}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-gray-500">
                          <span className="flex items-center gap-1">
                            📅 {ev.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {ev.time} HRS
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1 text-gray-400 truncate max-w-xs md:max-w-none">
                              <MapPin size={11} className="text-[#a855f7]" /> {ev.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-[#444455] hover:text-red-500 p-2 rounded-lg hover:bg-red-500/5 transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredEvents.length === 0 && (
              <div className="text-center py-16 bg-[#08080b]/60 rounded-2xl border border-dashed border-[#1a1a26]">
                <Calendar className="mx-auto text-gray-600 mb-3" size={32} />
                <p className="font-sans font-light text-sm text-gray-500 italic">
                  No hay compromisos programados.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
