import { useState } from 'react';
import { 
  Home, 
  CheckSquare, 
  FileText, 
  Calendar, 
  Repeat, 
  Timer, 
  DollarSign, 
  Gamepad2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  X,
  Cloud,
  Database,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  user: { name: string; photo: string; role: string };
  colorTema: string;
}

export default function Sidebar({
  currentSection,
  setCurrentSection,
  collapsed,
  setCollapsed,
  user,
  colorTema
}: SidebarProps) {
  const [showEnlargedAvatar, setShowEnlargedAvatar] = useState(false);
  const [showCloudConfigInfo, setShowCloudConfigInfo] = useState(false);
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home, desc: 'Panel de control neural' },
    { id: 'tareas', label: 'Tareas y Recordatorios', icon: CheckSquare, desc: 'Pendientes y prioridades' },
    { id: 'notas', label: 'Mis Notas', icon: FileText, desc: 'Base de conocimiento' },
    { id: 'agenda', label: 'Agenda', icon: Calendar, desc: 'Eventos y compromisos' },
    { id: 'rutina', label: 'Rutina y Hábitos', icon: Repeat, desc: 'Optimización de hábitos' },
    { id: 'pomodoros', label: 'Pomodoros', icon: Timer, desc: 'Ciclos de concentración' },
    { id: 'gastos', label: 'Mis Gastos', icon: DollarSign, desc: 'Control financiero' },
    { id: 'juego', label: 'Focus Bird', icon: Gamepad2, desc: 'Descompresión cognitiva', highlighted: true }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
      <aside 
        className={`fixed md:relative top-0 bottom-0 left-0 h-screen bg-[#0a0a0c] border-r border-[#1a1a1f] flex flex-col justify-between transition-all duration-300 ${
          collapsed 
            ? '-translate-x-full md:translate-x-0 w-72 md:w-20' 
            : 'translate-x-0 w-72'
        } z-50`}
        style={{
          boxShadow: `inset -10px 0 30px rgba(0, 0, 0, 0.4)`
        }}
      >
        {/* Brand & Toggle Button */}
        <div className="p-6 border-b border-[#16161a] flex items-center justify-between">
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-black text-xs tracking-wider transition-all duration-300 shrink-0"
                style={{
                  backgroundColor: colorTema,
                  boxShadow: `0 0 15px ${colorTema}`
                }}
              >
                F
              </div>
              <div>
                <span className="font-sans font-bold text-white text-lg tracking-wider block">
                  FOCUS
                </span>
                <span className="font-mono text-[9px] text-[#888892] tracking-widest uppercase -mt-1 block">
                  OS v1.0.4
                </span>
              </div>
            </motion.div>
          )}

          {collapsed && (
            <div 
              className="w-8 h-8 rounded-full mx-auto flex items-center justify-center font-mono font-black text-black text-xs tracking-wider transition-all duration-300"
              style={{
                backgroundColor: colorTema,
                boxShadow: `0 0 15px ${colorTema}`
              }}
            >
              F
            </div>
          )}

          {/* Floating Toggle button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex absolute right-[-14px] top-6 w-7 h-7 rounded-full bg-[#131318] border border-[#2a2a35] text-gray-400 hover:text-white items-center justify-center transition-all shadow-[0_4px_10px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

      {/* User Profile Summary */}
      <div className={`p-4 border-b border-[#16161a] transition-all ${collapsed ? 'text-center' : 'p-6'}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#00f2ff] to-[#a855f7] opacity-60 blur transition duration-300 group-hover:opacity-100" style={{ backgroundImage: `linear-gradient(to top right, ${colorTema}, #a855f7)` }} />
            <img 
              src={user.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"} 
              alt="Avatar de Usuario"
              title="Presiona para ampliar imagen"
              onClick={() => setShowEnlargedAvatar(true)}
              className="relative w-12 h-12 rounded-full object-cover border-2 border-[#121216] bg-[#1a1a24] cursor-pointer hover:scale-110 active:scale-95 transition-all duration-350"
              referrerPolicy="no-referrer"
            />
          </div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 min-w-0"
            >
              <h4 className="font-sans font-semibold text-white text-sm truncate leading-tight">
                {user.name}
              </h4>
              <p className="font-mono text-[10px] text-[#888892] tracking-wider uppercase mt-0.5 truncate">
                {user.role}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Menu Sections */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
        {menuItems.map((item) => {
          const isSelected = currentSection === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentSection(item.id);
                if (window.innerWidth < 768) {
                  setCollapsed(true);
                }
              }}
              className={`w-full group relative flex items-center gap-4 py-3 px-4 rounded-xl transition-all text-left ${
                isSelected 
                  ? 'bg-gradient-to-r from-[#171720] to-[#121217] text-white border border-[#2a2a38]' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#111116] border border-transparent'
              }`}
            >
              {isSelected && (
                <motion.div 
                  layoutId="sidebarActiveIndicator"
                  className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r"
                  style={{ backgroundColor: colorTema }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <IconComponent 
                size={18} 
                className={`transition-transform duration-300 group-hover:scale-110 shrink-0`}
                style={{ color: isSelected ? colorTema : undefined }}
              />

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-sans font-medium text-xs tracking-wide ${isSelected ? 'text-white font-semibold' : ''}`}>
                      {item.label}
                    </span>
                    {item.highlighted && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse" />
                    )}
                  </div>
                  <p className="font-mono text-[9px] text-[#555562] mt-0.5 truncate leading-none">
                    {item.desc}
                  </p>
                </div>
              )}

              {!collapsed && isSelected && (
                <ChevronRight size={12} className="text-gray-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Soporte, Quejas o Sugerencias Button */}
      <div className={`p-4 border-t border-[#161620] ${collapsed ? 'text-center' : 'px-5 py-3.5 bg-[#08080d]/40'}`}>
        <a 
          href="mailto:jonathandelangel000@gmail.com?subject=Soporte / Queja / Sugerencia o Comentario - Focus OS"
          className={`flex items-center gap-3 py-2.5 px-3 rounded-xl border border-dashed border-[#232332] hover:border-red-500/40 hover:bg-red-500/10 text-gray-400 hover:text-white transition-all text-left group/btn ${
            collapsed ? 'inline-flex justify-center items-center w-10 h-10 p-0 rounded-full' : ''
          }`}
          title="Soporte, Quejas y Sugerencias"
        >
          <LifeBuoy size={16} className="text-red-400 shrink-0 group-hover/btn:animate-spin" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <span className="font-sans font-medium text-[11px] block text-gray-300 group-hover/btn:text-white transition-colors">
                Soporte y Quejas
              </span>
              <span className="font-mono text-[8px] text-gray-500 block uppercase tracking-wider leading-none mt-0.5">
                Enviar Correo
              </span>
            </div>
          )}
        </a>
      </div>

      {/* Cloud Sync Status info widget (Punto 1) */}
      {!collapsed && (
        <div className="p-4 border-t border-[#14141c] bg-[#07070a]/40 shrink-0">
          <button 
            type="button"
            onClick={() => setShowCloudConfigInfo(true)}
            className="w-full p-2.5 rounded-xl border border-[#1c1c24] bg-black/40 hover:bg-[#111116] hover:border-[#2b2b35] transition-all flex items-center justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div>
                <span className="font-sans font-medium text-[10px] text-gray-300 group-hover:text-white transition-colors block leading-tight">
                  Sincronización
                </span>
                <span className="font-mono text-[7.5px] text-emerald-500 uppercase tracking-widest block font-bold mt-0.5">
                  Firestore Activo ✓
                </span>
              </div>
            </div>
            
            <span className="font-mono text-[8px] text-[#444455] group-hover:text-gray-350 transition-colors uppercase border border-[#1b1b26] px-1.5 py-0.5 rounded bg-[#09090b] tracking-wider shrink-0">
              INFO
            </span>
          </button>
        </div>
      )}

      {/* System Status Credit */}
      {!collapsed && (
        <div className="p-5 border-t border-[#131118] bg-[#07070a]/50 text-center shrink-0">
          <p className="font-mono text-[8px] text-[#444452] uppercase tracking-widest leading-relaxed">
            - Desarrollado por Jonathan Del Angel -
          </p>
        </div>
      )}

      {/* Enlarged Avatar Modal Zoom Panel */}
      <AnimatePresence>
        {/* Cloud Architecture Explanation Modal */}
        {showCloudConfigInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
            onClick={() => setShowCloudConfigInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative max-w-md w-full bg-[#0a0a0f] border border-[#1c1c27] rounded-3xl p-6 space-y-5 shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-default text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header inside modal */}
              <div className="flex items-center justify-between pb-3 border-b border-[#161622]">
                <div className="flex items-center gap-2">
                  <Cloud size={16} className="text-emerald-400" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#888892] font-bold">Resguardo de Datos Focus OS</span>
                </div>
                <button
                  onClick={() => setShowCloudConfigInfo(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Core Content */}
              <div className="space-y-4">
                <div className="flex gap-3.5 items-start">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                    <Database size={15} />
                  </div>
                  <div>
                    <h5 className="font-sans font-semibold text-white text-xs">Almacenamiento Continuo en Firebase Firestore</h5>
                    <p className="text-[11px] text-gray-400 font-light mt-1 leading-relaxed">
                      Todas tus notas, rutinas de hábitos, eventos redactados, tareas pendientes y gastos financieros se transmiten de inmediato a nuestra base de datos en tiempo real de <b>Google Firebase</b>. No dependen de la memoria de tu dispositivo.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                    <Shield size={15} />
                  </div>
                  <div>
                    <h5 className="font-sans font-semibold text-white text-xs font-bold">Privacidad Aislada por UID de Usuario</h5>
                    <p className="text-[11px] text-gray-400 font-light mt-1 leading-relaxed">
                      Focus OS aplica reglas de seguridad de datos estrictas en Firestore. Tus datos están completamente segregados por tu Identificador de Cuenta (<b>UID</b>), garantizando que nungún otro usuario pueda leer, modificar u husmear tus notas o gastos personales.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                    <Cloud size={15} />
                  </div>
                  <div>
                    <h5 className="font-sans font-semibold text-white text-xs">Encriptación TLS 1.3 de Extremo a Extremo</h5>
                    <p className="text-[11px] text-gray-400 font-light mt-1 leading-relaxed">
                      Toda comunicación de datos viaja de manera fluida utilizando SSL/TLS de última generación entre tu navegador de internet y la infraestructura segura de Google, previniendo interrupciones o capturas de datos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Informative notification footnote */}
              <div className="bg-[#12121c] p-3 rounded-2xl border border-[#212130] text-[10px] text-gray-400 flex items-center gap-2">
                <span>⚡</span>
                <span>Tu sesión se mantiene sincronizada de forma transparente conforme agregas o editas contenido.</span>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowCloudConfigInfo(false)}
                className="w-full py-3 rounded-xl text-black text-xs font-mono font-bold uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
                style={{ backgroundColor: colorTema }}
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
        {showEnlargedAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
            onClick={() => setShowEnlargedAvatar(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 10, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative max-w-sm w-full bg-[#0d0d15] border border-[#212130] rounded-3xl p-6 text-center space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header inside zoom */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1b1b2a]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892]">Visualizador del Perfil</span>
                <button
                  onClick={() => setShowEnlargedAvatar(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Large Image container */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-inner">
                <img
                  src={user.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"}
                  alt="Avatar Grande"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* User details info inside modal review */}
              <div className="space-y-1 pt-1">
                <h3 className="font-sans font-bold text-white text-lg tracking-tight">
                  {user.name}
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500" style={{ color: colorTema }}>
                  {user.role}
                </p>
              </div>

              {/* Action button inside modal review */}
              <button
                onClick={() => setShowEnlargedAvatar(false)}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-[#2a2a38] text-white text-xs font-mono uppercase tracking-wider hover:bg-white/10 transition cursor-pointer"
              >
                Cerrar vista
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
   </>
  );
}
