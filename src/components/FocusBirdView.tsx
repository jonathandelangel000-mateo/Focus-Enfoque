import { useState, useRef } from 'react';
import { Gamepad2, Play, RefreshCw, ExternalLink, Trophy, Monitor, Compass, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface FocusBirdViewProps {
  colorTema: string;
  addNotification?: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function FocusBirdView({ colorTema, addNotification }: FocusBirdViewProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const gameUrl = "https://jonathandelangel000-mateo.github.io/Juego/";

  const handleRefresh = () => {
    setIframeLoaded(false);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="border-b border-[#16161a] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#888892]">
            CONEXIÓN REMOTA DE DESCOMPRESIÓN
          </span>
          <h2 className="font-sans font-light text-white text-3xl tracking-tight mt-1">
            Módulo Recreativo: <span className="font-medium" style={{ color: colorTema }}>Fruit Splash & Focus Bird</span>
          </h2>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2.5 bg-[#0a0a0f] border border-[#212130] rounded-xl px-4 py-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div>
            <span className="font-mono text-[8px] text-gray-500 block uppercase">SERVIDOR DE JUEGO</span>
            <span className="font-sans font-bold text-xs text-white block">CONEXIÓN INSTANTÁNEA</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Play zone - Embedded frame (8 cols) */}
        <div className="lg:col-span-8 flex flex-col p-4 bg-[#0a0a0e] border border-[#161622] rounded-2xl relative shadow-[0_8px_30px_rgb(0,0,0,0.6)]">
          
          {/* Header toolbar for Iframe control */}
          <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#161620]">
            <div className="flex items-center gap-2">
              <Monitor size={14} className="text-gray-400" style={{ color: colorTema }} />
              <span className="font-mono text-[10px] text-[#888892] uppercase tracking-wider">Ventana de Ejecución Virtual</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                title="Recargar Consola"
                className="p-1 px-2.5 rounded-lg bg-[#111116] border border-[#21212b] hover:border-gray-500 hover:text-white text-gray-400 transition text-[10px] font-mono uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={10} className={!iframeLoaded ? "animate-spin" : ""} />
                Reiniciar
              </button>
            </div>
          </div>

          {/* Real Embedded Game Frame Container */}
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[480px] bg-[#050508] rounded-xl overflow-hidden border border-[#171725] flex items-center justify-center">
            
            {!iframeLoaded && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07070a] gap-4">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute w-full h-full rounded-full border-t border-b border-gray-700 animate-spin" style={{ borderColor: colorTema, borderLeftColor: 'transparent', borderRightColor: 'transparent' }} />
                  <Gamepad2 size={20} className="text-gray-400 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-[10px] uppercase text-[#888892] tracking-widest">Sincronizando Consola de Juego</p>
                  <p className="font-sans text-[11px] text-gray-500 mt-1">Conectando con el servidor GitHub Pages...</p>
                </div>
              </div>
            )}

            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={gameUrl}
              onLoad={() => setIframeLoaded(true)}
              className="w-full h-full border-none z-0"
              allow="autoplay; fullscreen; gamepad"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] font-mono text-gray-500 uppercase">
            <span className="flex items-center gap-1.5">
              <Sparkles size={10} className="text-[#d4af37]" /> Juego Real cargado directamente desde tu servidor GitHub Pages
            </span>
            <span>Versión de Producción</span>
          </div>
        </div>

        {/* Controls, Quick Actions & Guidelines (4 cols) */}
        <div className="lg:col-span-4 bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6 space-y-6">
          <div className="space-y-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
              <Compass size={12} className="text-purple-500" style={{ color: colorTema }} /> Opciones de Visualización
            </span>
            <p className="font-sans text-xs text-gray-400 font-light leading-relaxed">
              Hemos integrado tu videojuego <b>Focus Bird / Fruit Splash</b> real directamente en la misma ventana de la consola. Puedes jugar en el marco interactivo de la izquierda o lanzarlo en una pestaña dedicada.
            </p>
          </div>

          {/* Quick play primary action CTA */}
          <div className="space-y-3">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] block">
              PORTALES EXTERNOS COMPACTOS
            </span>
            <p className="text-[10px] text-gray-500 leading-normal">
              Para disfrutar del juego en pantalla completa nativa sin restricciones de contenedores y con soporte completo de mandos:
            </p>
            
            <a
              href={gameUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-gray-900 to-[#101017] hover:from-white/10 hover:to-white/5 border border-white/10 hover:border-white/30 text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-lg hover:shadow-cyan-900/10"
              style={{ borderColor: `rgba(255, 255, 255, 0.1)` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colorTema }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `rgba(255, 255, 255, 0.1)` }}
            >
              <span>Jugar Juego Real</span>
              <ExternalLink size={13} style={{ color: colorTema }} />
            </a>
          </div>

          <div className="border-t border-[#161622] pt-6 space-y-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] block">
              NOTAS DE OPERADOR
            </span>
            <div className="bg-[#12121c]/40 border border-[#1b1b26] rounded-xl p-3.5 text-[11px] font-sans text-gray-400 font-light space-y-2">
              <p>
                • <b>Pantalla Completa:</b> Si el juego no recibe tus teclas o clics correctos, presiona el botón superior "Reiniciar" o ábrelo en pestaña dedicada.
              </p>
              <p>
                • <b>Persistencia Externa:</b> Los récords y puntajes se gestionan de manera remota según las directivas nativas del servidor GitHub Pages.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
