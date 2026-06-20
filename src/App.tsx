import { useState, useEffect, ChangeEvent } from 'react';
import { 
  Plus, 
  Settings, 
  LogOut, 
  User as UserIcon, 
  HelpCircle, 
  Palette,
  X,
  Sparkles,
  Upload,
  LifeBuoy,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Subcomponents imports
import Sidebar from './components/Sidebar';
import AestheticDashboard from './components/AestheticDashboard';
import TareasView from './components/TareasView';
import NotasView from './components/NotasView';
import AgendaView from './components/AgendaView';
import RutinaView from './components/RutinaView';
import GastosView from './components/GastosView';
import PomodorosView from './components/PomodorosView';
import FocusBirdView from './components/FocusBirdView';

// Seed data
import { 
  INITIAL_NOTES, 
  INITIAL_TASKS, 
  INITIAL_HABITS, 
  INITIAL_EVENTS, 
  INITIAL_EXPENSES, 
  INITIAL_QUOTES 
} from './seedData';

import { Note, Task, Habit, AgendaEvent, Expense, Quote } from './types';

const PRESET_AVATARS = [
  { name: 'Ciber Punk', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=256&auto=format&fit=crop' },
  { name: 'Astronauta', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256&auto=format&fit=crop' },
  { name: 'Abstracto', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=256&auto=format&fit=crop' },
  { name: 'Zen', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=256&auto=format&fit=crop' },
  { name: 'Diseñadora', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop' }
];

export default function App() {
  // Current active navigation section
  const [currentSection, setCurrentSection] = useState('inicio');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('focus_theme_mode') as 'dark' | 'light') || 'dark';
  });

  const handleUpdateThemeMode = (mode: 'dark' | 'light') => {
    setThemeMode(mode);
    localStorage.setItem('focus_theme_mode', mode);
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error al intentar activar pantalla completa: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Core structures states
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  // User details matching existing structure: focus_user
  const [user, setUser] = useState({
    name: 'Usuario',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
    role: 'Master Optimizer'
  });

  // Theme accent matching: focus_color_tema
  const [colorTema, setColorTema] = useState('#00f2ff');

  // Load from LocalStorage
  useEffect(() => {
    // 1. User Profile setup
    const storageUser = localStorage.getItem('focus_user');
    if (storageUser) {
      try {
        const parsed = JSON.parse(storageUser);
        setUser({
          name: parsed.name || 'Usuario',
          photo: parsed.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
          role: parsed.role || 'Master Optimizer'
        });
      } catch (err) {
        console.error("Failed loading focus_user");
      }
    } else {
      localStorage.setItem('focus_user', JSON.stringify(user));
    }

    // 2. Theme accent color setup
    const storedTema = localStorage.getItem('focus_color_tema');
    if (storedTema) {
      setColorTema(storedTema);
      document.documentElement.style.setProperty('--acento', storedTema);
    } else {
      localStorage.setItem('focus_color_tema', colorTema);
      document.documentElement.style.setProperty('--acento', colorTema);
    }

    // 3. Data Tables loads with seed fallbacks
    const storedNotes = localStorage.getItem('focus_notes');
    if (storedNotes) {
      try { setNotes(JSON.parse(storedNotes)); } catch (e) { setNotes(INITIAL_NOTES); }
    } else {
      setNotes(INITIAL_NOTES);
      localStorage.setItem('focus_notes', JSON.stringify(INITIAL_NOTES));
    }

    const storedTasks = localStorage.getItem('focus_tasks');
    if (storedTasks) {
      try { setTasks(JSON.parse(storedTasks)); } catch (e) { setTasks(INITIAL_TASKS); }
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem('focus_tasks', JSON.stringify(INITIAL_TASKS));
    }

    const storedHabits = localStorage.getItem('focus_habits');
    if (storedHabits) {
      try { setHabits(JSON.parse(storedHabits)); } catch (e) { setHabits(INITIAL_HABITS); }
    } else {
      setHabits(INITIAL_HABITS);
      localStorage.setItem('focus_habits', JSON.stringify(INITIAL_HABITS));
    }

    const storedEvents = localStorage.getItem('focus_events');
    if (storedEvents) {
      try { setEvents(JSON.parse(storedEvents)); } catch (e) { setEvents(INITIAL_EVENTS); }
    } else {
      setEvents(INITIAL_EVENTS);
      localStorage.setItem('focus_events', JSON.stringify(INITIAL_EVENTS));
    }

    const storedExpenses = localStorage.getItem('focus_expenses');
    if (storedExpenses) {
      try { setExpenses(JSON.parse(storedExpenses)); } catch (e) { setExpenses(INITIAL_EXPENSES); }
    } else {
      setExpenses(INITIAL_EXPENSES);
      localStorage.setItem('focus_expenses', JSON.stringify(INITIAL_EXPENSES));
    }

    const storedQuotes = localStorage.getItem('focus_quotes');
    if (storedQuotes) {
      try { setQuotes(JSON.parse(storedQuotes)); } catch (e) { setQuotes(INITIAL_QUOTES); }
    } else {
      setQuotes(INITIAL_QUOTES);
      localStorage.setItem('focus_quotes', JSON.stringify(INITIAL_QUOTES));
    }

    // Simulate active session to integrate with legacy views
    sessionStorage.setItem('sesion_activa', 'true');
  }, []);

  // Sync state modifications to LocalStorage
  const updateAndPersistNotes = (newN: any) => {
    const updated = typeof newN === 'function' ? newN(notes) : newN;
    setNotes(updated);
    localStorage.setItem('focus_notes', JSON.stringify(updated));
  };

  const updateAndPersistTasks = (newT: any) => {
    const updated = typeof newT === 'function' ? newT(tasks) : newT;
    setTasks(updated);
    localStorage.setItem('focus_tasks', JSON.stringify(updated));
  };

  const updateAndPersistHabits = (newH: any) => {
    const updated = typeof newH === 'function' ? newH(habits) : newH;
    setHabits(updated);
    localStorage.setItem('focus_habits', JSON.stringify(updated));
  };

  const updateAndPersistEvents = (newE: any) => {
    const updated = typeof newE === 'function' ? newE(events) : newE;
    setEvents(updated);
    localStorage.setItem('focus_events', JSON.stringify(updated));
  };

  const updateAndPersistExpenses = (newEx: any) => {
    const updated = typeof newEx === 'function' ? newEx(expenses) : newEx;
    setExpenses(updated);
    localStorage.setItem('focus_expenses', JSON.stringify(updated));
  };

  const handleUpdateUser = (updatedUser: typeof user) => {
    setUser(updatedUser);
    localStorage.setItem('focus_user', JSON.stringify(updatedUser));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        handleUpdateUser({ ...user, photo: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateTema = (themeHex: string) => {
    setColorTema(themeHex);
    localStorage.setItem('focus_color_tema', themeHex);
    document.documentElement.style.setProperty('--acento', themeHex);
  };

  // Color theme palettes options
  const themeColors = [
    { name: 'Cero absoluto (Cyan)', hex: '#00f2ff', class: 'bg-[#00f2ff]' },
    { name: 'Oro Aurum (Champagne)', hex: '#d4af37', class: 'bg-[#d4af37]' },
    { name: 'Matrix Neón (Esmeralda)', hex: '#10b981', class: 'bg-[#10b981]' },
    { name: 'Nova Cósmica (Violeta)', hex: '#a855f7', class: 'bg-[#a855f7]' },
    { name: 'Ascua de Fuego (Carmesí)', hex: '#ff4d6d', class: 'bg-[#ff4d6d]' },
  ];

  // Render view router helper
  const renderActiveView = () => {
    switch (currentSection) {
      case 'inicio':
        return (
          <AestheticDashboard 
            notes={notes}
            tasks={tasks}
            habits={habits}
            events={events}
            expenses={expenses}
            quotes={quotes}
            setCurrentSection={setCurrentSection}
            colorTema={colorTema}
          />
        );
      case 'tareas':
        return (
          <TareasView 
            tasks={tasks}
            setTasks={updateAndPersistTasks}
            colorTema={colorTema}
          />
        );
      case 'notas':
        return (
          <NotasView 
            notes={notes}
            setNotes={updateAndPersistNotes}
            colorTema={colorTema}
          />
        );
      case 'agenda':
        return (
          <AgendaView 
            events={events}
            setEvents={updateAndPersistEvents}
            colorTema={colorTema}
          />
        );
      case 'rutina':
        return (
          <RutinaView 
            habits={habits}
            setHabits={updateAndPersistHabits}
            colorTema={colorTema}
          />
        );
      case 'pomodoros':
        return (
          <PomodorosView 
            colorTema={colorTema}
          />
        );
      case 'gastos':
        return (
          <GastosView 
            expenses={expenses}
            setExpenses={updateAndPersistExpenses}
            colorTema={colorTema}
          />
        );
      case 'juego':
        return (
          <FocusBirdView 
            colorTema={colorTema}
          />
        );
      default:
        return <div className="text-white">Sección en mantenimiento progresivo.</div>;
    }
  };

  return (
    <div className={`flex h-screen ${themeMode === 'light' ? 'light-mode bg-[#f6f7fb] text-[#12131a]' : 'bg-[#07070a] text-[#ededf0]'} overflow-hidden font-sans transition-colors duration-300`}>
      
      {/* Sidebar Panel Navigation */}
      <Sidebar 
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        user={user}
        colorTema={colorTema}
      />

      {/* Main viewport Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Floating background grids for deep modern aesthetic */}
        <div className="absolute inset-0 bg-[radial-gradient(#151524_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        {/* Global upper glass Header bar */}
        <header className="h-[76px] bg-[#08080c]/80 backdrop-blur-md border-b border-[#14141a] px-8 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorTema }} />
            <span className="font-mono text-xs uppercase tracking-widest text-[#888892] select-none">
              VÍNCULO COGNITIVO ACTIVO
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Botón de pantalla completa */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-[#111116] border border-[#21212b] hover:border-gray-500 hover:text-white text-gray-400 transition cursor-pointer flex items-center gap-1.5"
              title={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span className="hidden md:inline font-mono text-[9px] uppercase tracking-widest font-medium">
                {isFullscreen ? "Pantalla Normal" : "Pantalla Completa"}
              </span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2.5 rounded-xl bg-[#111116] border border-[#21212b] hover:border-gray-500 hover:text-white text-gray-400 transition cursor-pointer"
            >
              <Settings size={16} />
            </button>
          </div>
        </header>

        {/* Main Content section with smooth scroll */}
        <main className="flex-1 overflow-y-auto w-full relative z-10 px-8 py-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="max-w-6xl mx-auto w-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Account Profile & Color Theme customizer slide-out drawer */}
      <AnimatePresence>
        {showSettingsModal && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="absolute inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Slide menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="absolute right-0 top-0 bottom-0 w-80 md:w-96 bg-[#0a0a0f] border-l border-[#1a1a24] z-50 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#14141f] pb-4">
                  <h3 className="font-sans font-semibold text-lg text-white flex items-center gap-2">
                    <Palette size={18} className="text-[#00f2ff]" style={{ color: colorTema }} />
                    Ajustes de Interfaz
                  </h3>
                  <button 
                    onClick={() => setShowSettingsModal(false)}
                    className="p-1 rounded-lg hover:bg-[#1a1a24] text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Profile form */}
                <div className="space-y-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892]">Detalles del Operador</span>
                  
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-gray-500 uppercase">Nombre</label>
                    <input 
                      type="text" 
                      value={user.name}
                      onChange={e => handleUpdateUser({ ...user, name: e.target.value })}
                      className="w-full bg-[#111116] border border-[#21212b] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-gray-500 font-sans"
                    />
                  </div>

                  {/* Photo selector (Presets + Custom Upload) */}
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-gray-500 uppercase block">Imagen de Perfil</label>
                    
                    {/* Presets Grid */}
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      {PRESET_AVATARS.map((avatar, idx) => {
                        const isSelected = user.photo === avatar.url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            title={avatar.name}
                            onClick={() => handleUpdateUser({ ...user, photo: avatar.url })}
                            className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all relative shrink-0 ${
                              isSelected 
                                ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.45)]' 
                                : 'border-[#1b1b26] opacity-60 hover:opacity-100 hover:scale-105'
                            }`}
                          >
                            <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        );
                      })}
                      
                      {/* Upload Button */}
                      <label 
                        className="w-9 h-9 rounded-full border-2 border-dashed border-[#2b2b36] hover:border-gray-400 bg-[#111116] hover:bg-[#16161f] flex items-center justify-center cursor-pointer transition-all shrink-0 group relative overflow-hidden" 
                        title="Subir imagen personalizada"
                      >
                        <Upload size={14} className="text-gray-400 group-hover:text-white transition-colors" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          className="hidden" 
                        />
                      </label>
                    </div>

                    {/* URL Input Fallback */}
                    <input 
                      type="text" 
                      placeholder="O pega una URL de imagen..."
                      value={user.photo.startsWith('data:') ? 'Imagen personalizada subida ✓' : user.photo}
                      onChange={e => {
                        if (!e.target.value.startsWith('Imagen personalizada')) {
                          handleUpdateUser({ ...user, photo: e.target.value });
                        }
                      }}
                      className="w-full bg-[#111116] border border-[#21212b] rounded-lg px-3 py-1.5 text-[10px] text-gray-300 focus:outline-none focus:border-gray-500 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-gray-500 uppercase">Rol ocupacional</label>
                    <input 
                      type="text" 
                      value={user.role}
                      onChange={e => handleUpdateUser({ ...user, role: e.target.value })}
                      className="w-full bg-[#111116] border border-[#21212b] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-gray-500"
                    />
                  </div>
                </div>

                {/* Theme Mode Toggle Options */}
                <div className="space-y-3 pt-4 border-t border-[#14141f]">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
                    <Sparkles size={10} style={{ color: colorTema }} /> Esquema de Color (Luz)
                  </span>
                  <div className="grid grid-cols-2 gap-2 bg-[#111116] p-1 rounded-xl border border-[#21212b]">
                    <button
                      type="button"
                      onClick={() => handleUpdateThemeMode('dark')}
                      className={`py-2 px-3 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        themeMode === 'dark'
                          ? 'bg-white/10 text-white font-bold border border-white/20'
                          : 'bg-transparent text-gray-400 hover:text-white border border-transparent'
                      }`}
                    >
                      Oscuro
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateThemeMode('light')}
                      className={`py-2 px-3 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        themeMode === 'light'
                          ? 'bg-neutral-800 text-white font-bold border border-neutral-700'
                          : 'bg-transparent text-gray-400 hover:text-neutral-850 border border-transparent'
                      }`}
                    >
                      Claro
                    </button>
                  </div>
                </div>

                {/* Palette Select */}
                <div className="space-y-3.5 pt-4 border-t border-[#14141f]">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
                    <Palette size={10} /> Paleta de Color de la Consola
                  </span>
                  
                  <div className="space-y-2">
                    {themeColors.map(color => {
                      const isSelected = colorTema === color.hex;
                      return (
                        <button
                          key={color.hex}
                          onClick={() => handleUpdateTema(color.hex)}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition cursor-pointer ${
                            isSelected 
                              ? 'bg-white/5 border-white text-white font-medium' 
                              : 'bg-transparent border-[#1b1b26] text-gray-400 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${color.class}`} />
                            {color.name}
                          </span>
                          {isSelected && <span className="font-mono text-[9px] text-[#00f2ff]" style={{ color: colorTema }}>ACTIVO</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Settings footer */}
              <div className="pt-5 border-t border-[#14141f] space-y-3.5">
                <a
                  href="mailto:jonathandelangel000@gmail.com?subject=Soporte / Queja / Sugerencia o Comentario - Focus OS"
                  className="w-full py-2.5 px-4 rounded-xl bg-red-950/10 hover:bg-red-900/10 border border-dashed border-red-500/20 hover:border-red-500/50 text-[#ff7b7b] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LifeBuoy size={12} className="hover:animate-spin shrink-0 text-red-400" /> 
                  Soporte, Quejas o Sugerencias
                </a>
                <p className="font-mono text-[9px] text-[#555562] text-center uppercase tracking-widest leading-relaxed">
                  Focus Console 1.0.4. Sistema de persistencia asíncrono configurado por completo.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
