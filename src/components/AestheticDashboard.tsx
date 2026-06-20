import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Quote as QuoteIcon, 
  CheckSquare, 
  Repeat, 
  Calendar, 
  FileText, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note, Task, Habit, AgendaEvent, Expense, Quote } from '../types';

interface AestheticDashboardProps {
  notes: Note[];
  tasks: Task[];
  habits: Habit[];
  events: AgendaEvent[];
  expenses: Expense[];
  quotes: Quote[];
  setCurrentSection: (section: string) => void;
  colorTema: string;
}

export default function AestheticDashboard({
  notes,
  tasks,
  habits,
  events,
  expenses,
  quotes,
  setCurrentSection,
  colorTema
}: AestheticDashboardProps) {
  // Rotate Quotes State
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Combine standard quotes with notes marked as quotes
  const userQuotesFromNotes = notes
    .filter(n => n.isQuote)
    .map(n => ({
      id: n.id,
      text: n.content.split('\n')[0] || n.title, // First line as text
      author: n.title // Note title as author
    }));

  const allQuotes = [...quotes, ...userQuotesFromNotes];

  // Auto rotate quotes every 10 seconds
  useEffect(() => {
    if (allQuotes.length === 0) return;
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % allQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [allQuotes.length]);

  const handleNextQuote = () => {
    setCurrentQuoteIndex(prev => (prev + 1) % allQuotes.length);
  };

  const handlePrevQuote = () => {
    setCurrentQuoteIndex(prev => (prev - 1 + allQuotes.length) % allQuotes.length);
  };

  // Get current date string (YYYY-MM-DD)
  const getTodayStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();

  // Calculate Routine Compliance for TODAY
  const dailyHabitsCount = habits.length;
  const completedTodayCount = habits.filter(h => h.completedDays[todayStr] === true).length;
  const todayCompliancePct = dailyHabitsCount > 0 
    ? Math.round((completedTodayCount / dailyHabitsCount) * 100) 
    : 0;

  // Determine if we are "Cumpliendo" today (e.g. >= 70% completed or all completed if total < 3)
  const isMeetingRoutineToday = dailyHabitsCount > 0 
    ? (completedTodayCount === dailyHabitsCount || todayCompliancePct >= 66) 
    : false;

  // Calculate past 7 days statistics for the Activity Graph
  const getPast7Days = () => {
    const arr = [];
    const daysName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      arr.push({
        dateStr,
        label: daysName[d.getDay()],
        dayNum: d.getDate()
      });
    }
    return arr;
  };

  const past7Days = getPast7Days();

  // For each of the past 7 days, get user compliance rate of routine
  const listActivities = past7Days.map(day => {
    const totalHabits = habits.length;
    if (totalHabits === 0) return { ...day, compliance: 100 }; // default empty state
    const completed = habits.filter(h => h.completedDays[day.dateStr] === true).length;
    const rate = Math.round((completed / totalHabits) * 100);
    return {
      ...day,
      compliance: rate,
      completed,
      totalHabits
    };
  });

  // Basic totals
  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 3);

  const totalExpenseAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // SVG dimensions for weekly performance chart
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = 500;
  const chartHeight = 200;

  // Compute SVG coordinates for the actual polyline
  const pointCoords = listActivities.map((day, index) => {
    const x = paddingX + (index * ((chartWidth - paddingX * 2) / 6));
    // 100% compliance is at paddingY, 0% is at chartHeight - paddingY
    const y = (chartHeight - paddingY) - (day.compliance / 100) * (chartHeight - paddingY * 2);
    return { x, y, ...day };
  });

  const polylinePointsStr = pointCoords.map(p => `${p.x},${p.y}`).join(' ');
  // For the gradient area fill, we start from bottom-left corner, go to graph points, and close at bottom-right
  const firstPoint = pointCoords[0];
  const lastPoint = pointCoords[pointCoords.length - 1];
  const bottomY = chartHeight - paddingY;
  const areaPointsStr = `${firstPoint.x},${bottomY} ${polylinePointsStr} ${lastPoint.x},${bottomY}`;

  return (
    <div className="space-y-8 pb-12">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#16161a] pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#888892] flex items-center gap-2">
            <Sparkles size={12} className="text-[#00f2ff]" /> SISTEMA OPERATIVO COGNITIVO
          </span>
          <h2 className="font-sans font-light text-white text-3xl tracking-tight mt-1">
            Pantalla de <span className="font-medium text-white">Inicio</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 bg-[#111116] border border-[#1d1d24] rounded-xl px-4 py-2 text-right">
          <Clock size={16} className="text-[#888892]" />
          <div>
            <p className="font-mono text-xs text-white leading-none">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="font-mono text-[10px] text-gray-500 mt-1 uppercase tracking-wider">
              ZONA HORARIA LOCAL
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 2 columns (Quote & Health habit overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Animated Rotating Quotes Widget (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#0c0c10] to-[#010103] border border-[#16161c] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[230px]">
          <div className="absolute right-[-20px] top-[-20px] text-[#ffffff02] pointer-events-none select-none">
            <QuoteIcon size={140} />
          </div>
          
          <div className="flex items-center justify-between border-b border-[#16161a] pb-3 mb-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
              <QuoteIcon size={10} className="text-[#a855f7]" /> FRASE DE ENFOQUE DEL DÍA
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={handlePrevQuote} 
                className="w-6 h-6 hover:bg-[#15151c] rounded flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={handleNextQuote} 
                className="w-6 h-6 hover:bg-[#15151c] rounded flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <p className="font-serif italic text-white md:text-lg text-sm text-gray-100 leading-relaxed font-light tracking-wide">
                  "{allQuotes[currentQuoteIndex]?.text || 'No hay frases configuradas.'}"
                </p>
                <p className="font-mono text-xs tracking-wider text-[#a855f7] flex items-center gap-2">
                  — {allQuotes[currentQuoteIndex]?.author || 'Estudiante'} 
                  <span className="inline-block w-1 h-3 bg-[#a855f7]/30" />
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-[#121217] pt-3 text-right">
            <button 
              onClick={() => setCurrentSection('notas')}
              className="font-mono text-[10px] text-gray-400 hover:text-white underline transition"
            >
              + Agregar frases desde Notas
            </button>
          </div>
        </div>

        {/* Daily routine completion widget CARD visual status (5 cols) */}
        <div className="lg:col-span-5 bg-[#0a0a0e] border border-[#16161c] rounded-2xl p-6 flex flex-col justify-between h-[230px]">
          <div className="flex items-center justify-between border-b border-[#16161a] pb-3 mb-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
              <Repeat size={10} className="text-[#00f2ff]" /> STATUS DE RUTINA DIARIA
            </span>
            <span className={`font-mono text-[10px] uppercase font-bold py-0.5 px-2 rounded-full ${
              isMeetingRoutineToday 
                ? 'bg-[rgba(0,242,255,0.08)] text-[#00f2ff] border border-[#00f2ff]/20' 
                : 'bg-[rgba(239,68,68,0.08)] text-[#ef4444] border border-[#ef4444]/20'
            }`}>
              {isMeetingRoutineToday ? 'CUMPLIENDO' : 'EN DESARROLLO'}
            </span>
          </div>

          <div className="flex items-center gap-6 py-2">
            {/* Circular completion ring */}
            <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#13131a]"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${todayCompliancePct}, 100` }}
                  transition={{ duration: 1 }}
                  className="text-[#00f2ff]"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{ stroke: colorTema }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-sans font-bold text-lg text-white leading-none">
                  {todayCompliancePct}%
                </span>
                <span className="font-mono text-[8px] text-gray-500 mt-0.5">
                  HECHO
                </span>
              </div>
            </div>

            {/* Quick descriptive card */}
            <div className="space-y-2">
              <h4 className="font-sans font-medium text-white text-sm">
                Hábitos de Hoy
              </h4>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Has completado <span className="font-semibold text-[#00f2ff]">{completedTodayCount}</span> de <span className="text-white font-semibold">{dailyHabitsCount}</span> actividades de tu rutina programada para el día.
              </p>
              
              <div className="flex items-center gap-1.5 mt-2">
                {isMeetingRoutineToday ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9px]">
                    <CheckCircle size={10} /> ¡Fidelidad Excelente!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400 font-mono text-[9px]">
                    <Clock size={10} /> Mantén la productividad
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-[#121217] pt-2 flex justify-between items-center text-[10px]">
            <span className="font-mono text-[#555562]">Sugerencia: Completa tu rutina antes de las 10 PM.</span>
            <button 
              onClick={() => setCurrentSection('rutina')}
              className="font-mono text-[#00f2ff] hover:underline"
              style={{ color: colorTema }}
            >
              Ir a Rutina →
            </button>
          </div>
        </div>

      </div>

      {/* Grid: Weekly activity and quick bento navigation cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Activity Line/Area Graph (7 cols) */}
        <div className="lg:col-span-7 bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6 flex flex-col justify-between h-[360px]">
          <div className="flex items-center justify-between border-b border-[#16161a] pb-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
                <TrendingUp size={12} className="text-[#00f2ff]" /> GRÁFICA DE ACTIVIDAD SEMANAL
              </span>
              <p className="font-sans font-normal text-xs text-gray-500 mt-1">
                Fidelidad y cumplimiento de hábitos en los últimos 7 días. Las caídas muestran días incompletos.
              </p>
            </div>
            
            <div className="text-right">
              <span className="font-mono font-bold text-sm text-[#00f2ff]" style={{ color: colorTema }}>
                {Math.round(listActivities.reduce((a, b) => a + b.compliance, 0) / 7)}% 
              </span>
              <p className="font-mono text-[8px] text-gray-500 uppercase">PROM. SEMANAL</p>
            </div>
          </div>

          {/* Graph visual area */}
          <div className="flex-1 w-full flex items-center justify-center relative mt-4">
            <svg 
              className="w-full h-full" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colorTema} stopOpacity="0.15" />
                  <stop offset="100%" stopColor={colorTema} stopOpacity="0.00" />
                </linearGradient>
                <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor={colorTema} floodOpacity="0.35"/>
                </filter>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#131319" strokeWidth="1" strokeDasharray="3,3" />
              <line x1={paddingX} y1={(chartHeight / 2)} x2={chartWidth - paddingX} y2={(chartHeight / 2)} stroke="#131319" strokeWidth="1" strokeDasharray="3,3" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#161622" strokeWidth="1" />

              {/* Area Gradient */}
              <polygon points={areaPointsStr} fill="url(#chartGradient)" />

              {/* Line */}
              <polyline
                fill="none"
                stroke={colorTema}
                strokeWidth="2.5"
                points={polylinePointsStr}
                filter="url(#glow)"
              />

              {/* Day Points & Tooltips */}
              {pointCoords.map((point, idx) => (
                <g key={idx} className="cursor-pointer group">
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#0a0a0f"
                    stroke={colorTema}
                    strokeWidth="2"
                    className="hover:r-6 transition-all"
                  />
                  {/* Tooltip text when hovered or standard visual indicator */}
                  <text
                    x={point.x}
                    y={point.y - 10}
                    fill="#aeaebe"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-black"
                  >
                    {point.compliance}%
                  </text>
                  
                  {/* Bottom Day Label */}
                  <text
                    x={point.x}
                    y={chartHeight - 10}
                    fill="#666675"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {point.label}
                  </text>
                  <text
                    x={point.x}
                    y={chartHeight - 1}
                    fill="#444452"
                    fontSize="7"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {point.dayNum}
                  </text>
                </g>
              ))}

              {/* Y Axis Reference Labels */}
              <text x={10} y={paddingY + 3} fill="#444452" fontSize="8" fontFamily="monospace">100%</text>
              <text x={10} y={(chartHeight / 2) + 3} fill="#444452" fontSize="8" fontFamily="monospace">50%</text>
              <text x={10} y={chartHeight - paddingY + 3} fill="#444452" fontSize="8" fontFamily="monospace">0%</text>
            </svg>
          </div>

          <div className="border-t border-[#121217] pt-2 flex items-center justify-between text-[11px] text-[#888892] mt-2">
            <span className="flex items-center gap-1">
              <Info size={12} className="text-[#00f2ff]" /> 
              Al pasar el ratón se revelará el porcentaje del día
            </span>
            <span className="font-mono text-[9px] text-[#444452] uppercase">GRAFICADO DESDE COMPORTAMIENTO LOCAL</span>
          </div>
        </div>

        {/* Bento Board: Quick statistics of modules (5 cols) */}
        <div className="lg:col-span-5 h-[360px] flex flex-col gap-4">
          
          {/* Tareas Card */}
          <div 
            onClick={() => setCurrentSection('tareas')}
            className="flex-1 bg-[#0a0a0f] border border-[#16161c] rounded-xl p-4 flex items-center justify-between hover:border-gray-700 transition duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[rgba(168,85,247,0.06)] border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7]">
                <CheckSquare size={18} />
              </div>
              <div>
                <h4 className="font-sans font-medium text-white text-sm">Tareas y Recordatorios</h4>
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">
                  {pendingTasksCount} pendientes por concretar
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#444452]" />
          </div>

          {/* Agenda Card */}
          <div 
            onClick={() => setCurrentSection('agenda')}
            className="flex-1 bg-[#0a0a0f] border border-[#16161c] rounded-xl p-4 flex items-center justify-between hover:border-gray-700 transition duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[rgba(0,242,255,0.06)] border border-[#00f2ff]/20 flex items-center justify-center text-[#00f2ff]">
                <Calendar size={18} />
              </div>
              <div>
                <h4 className="font-sans font-medium text-white text-sm">Agenda de Compromisos</h4>
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">
                  PRÓXIMO: {upcomingEvents[0]?.title || 'Sin compromisos registrados'}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#444452]" />
          </div>

          {/* Mis Notas Card */}
          <div 
            onClick={() => setCurrentSection('notas')}
            className="flex-1 bg-[#0a0a0f] border border-[#16161c] rounded-xl p-4 flex items-center justify-between hover:border-gray-700 transition duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[rgba(239,68,68,0.06)] border border-red-500/20 flex items-center justify-center text-red-500">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="font-sans font-medium text-white text-sm">Mis Notas y Enfoques</h4>
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">
                  {notes.length} archivos | {notes.filter(n => n.isQuote).length} frases guardadas
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#444452]" />
          </div>

          {/* Gastos Card */}
          <div 
            onClick={() => setCurrentSection('gastos')}
            className="flex-1 bg-[#0a0a0f] border border-[#16161c] rounded-xl p-4 flex items-center justify-between hover:border-gray-700 transition duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[rgba(16,185,129,0.06)] border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <DollarSign size={18} />
              </div>
              <div>
                <h4 className="font-sans font-medium text-white text-sm">Mis Gastos</h4>
                <p className="font-mono text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">
                  Monto registrado: ${totalExpenseAmount.toLocaleString()} USD
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#444452]" />
          </div>

        </div>

      </div>

      {/* Grid: Events and Recent Notes Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming agenda schedule */}
        <div className="bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-[#16161a] pb-4 mb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
              <Clock size={12} className="text-[#a855f7]" /> LÍNEA TEMPORAL DE AGENDA
            </span>
            <span className="text-[10px] text-gray-500 font-mono">CRONOLÓGICO</span>
          </div>

          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="font-sans font-light text-xs text-gray-500 italic py-6 text-center">
                No hay eventos planificados para los próximos días.
              </p>
            ) : (
              upcomingEvents.map((ev, index) => (
                <div key={ev.id} className="relative flex gap-4">
                  {/* Timeline bullet design */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00f2ff] border border-black z-10" />
                    {index !== upcomingEvents.length - 1 && (
                      <div className="w-0.5 bg-gradient-to-b from-[#00f2ff]/40 to-transparent flex-1 my-1.5" />
                    )}
                  </div>
                  
                  <div className="pb-4 flex-1 bg-[#111116]/50 border border-[#161622] rounded-xl p-3.5 hover:bg-[#111118] transition">
                    <div className="flex justify-between items-start">
                      <h5 className="font-sans font-semibold text-white text-xs leading-none">
                        {ev.title}
                      </h5>
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#171725] rounded text-gray-400">
                        {ev.category}
                      </span>
                    </div>
                    <div className="flex gap-4 font-mono text-[10px] text-gray-500 mt-2.5">
                      <span>📅 {ev.date}</span>
                      <span>⏱️ {ev.time} HRS</span>
                      {ev.location && <span>📍 {ev.location}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent notes previews */}
        <div className="bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-[#16161a] pb-4 mb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
              <FileText size={12} className="text-red-500" /> RESUMEN DE NOTAS RECIENTES
            </span>
            <span className="text-[10px] text-gray-500 font-mono">INTELECTO</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.slice(0, 4).map(note => (
              <div 
                key={note.id} 
                className="bg-[#111116]/40 hover:bg-[#111117] border border-[#161622] rounded-xl p-4 transition flex flex-col justify-between h-[120px]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-sans font-medium text-white text-xs truncate">
                      {note.title}
                    </h5>
                    {note.isQuote && (
                      <span className="font-mono text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/10 px-1 py-0.2 rounded shrink-0">
                        FRÓNESIS
                      </span>
                    )}
                  </div>
                  <p className="font-sans font-light text-[11px] text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                    {note.content}
                  </p>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 mt-2">
                  <span>{note.category}</span>
                  <span>{note.createdAt.split(' ')[0]}</span>
                </div>
              </div>
            ))}

            {notes.length === 0 && (
              <div className="col-span-2 text-center py-6 text-gray-500 italic font-sans text-xs">
                No hay notas archivadas. Agrega una nota para poblar este panel.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
