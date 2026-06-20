import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PomodorosViewProps {
  colorTema: string;
}

export default function PomodorosView({ colorTema }: PomodorosViewProps) {
  // Timer durations in minutes
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);

  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Set the timer limits
  useEffect(() => {
    if (!isActive) {
      setSecondsLeft(mode === 'work' ? workTime * 60 : breakTime * 60);
    }
  }, [workTime, breakTime, mode, isActive]);

  // Core ticking effect
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            // Cycle ended
            clearInterval(timerRef.current!);
            setIsActive(false);
            
            // Audio alerting trigger
            if (soundEnabled) {
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
                oscillator.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.5);
              } catch (e) {
                console.log("Audio notification skipped");
              }
            }

            // Swap modes
            const nextMode = mode === 'work' ? 'break' : 'work';
            setMode(nextMode);
            return nextMode === 'work' ? workTime * 60 : breakTime * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, workTime, breakTime, soundEnabled]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setSecondsLeft(workTime * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentMaxSeconds = mode === 'work' ? workTime * 60 : breakTime * 60;
  const progressPct = ((currentMaxSeconds - secondsLeft) / currentMaxSeconds) * 100;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="border-b border-[#16161a] pb-6 flex items-center justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#888892]">
            CONCENTRACIÓN Y NEURO-PRODUCTIVIDAD
          </span>
          <h2 className="font-sans font-light text-white text-3xl tracking-tight mt-1">
            Modulador de <span className="font-medium">Pomodoros</span>
          </h2>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-4 py-2 rounded-xl border font-mono text-xs uppercase flex items-center gap-2 transition cursor-pointer ${
            soundEnabled 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
              : 'bg-[#111116] border-[#22222a] text-gray-500 hover:text-white'
          }`}
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          {soundEnabled ? 'Sonido ON' : 'Silencio'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left col: Duration picker options (4 cols) */}
        <div className="lg:col-span-4 bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6 space-y-6">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
            <Sparkles size={11} className="text-[#a855f7]" /> Ajustar Tiempos
          </span>

          {/* Work duration slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-white">
              <span className="font-sans font-medium">Ciclo de Enfoque (Minutos)</span>
              <span className="font-mono font-bold text-[#00f2ff]" style={{ color: colorTema }}>{workTime}M</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              disabled={isActive}
              value={workTime}
              onChange={e => setWorkTime(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#171725] rounded-xl appearance-none cursor-pointer accent-[#00f2ff] disabled:opacity-50"
            />
            <span className="font-mono text-[9px] text-[#444455] block">Estándar recomendado: 25 minutos.</span>
          </div>

          {/* Break duration slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-white">
              <span className="font-sans font-medium">Ciclo de Descanso (Minutos)</span>
              <span className="font-mono font-bold text-[#a855f7]">{breakTime}M</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              disabled={isActive}
              value={breakTime}
              onChange={e => setBreakTime(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#171725] rounded-xl appearance-none cursor-pointer accent-[#a855f7] disabled:opacity-50"
            />
            <span className="font-mono text-[9px] text-[#444455] block">Estándar recomendado: 5 minutos.</span>
          </div>

          <div className="pt-2 bg-[#12121c]/30 rounded-xl p-3.5 border border-[#1d1d28]/60">
            <p className="font-sans text-xs text-[#888895] leading-relaxed">
              🧘 <b>Deep Work Guideline:</b> Durante el ciclo de enfoque, desconecta notificaciones de celular y concéntrate al 100% en un solo pendiente a la vez.
            </p>
          </div>
        </div>

        {/* Right col: Animated Countdown Display (8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center py-6">
          <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center bg-black/40 rounded-full border border-[#1b1b26]/50">
            
            {/* SVG circle stroke representation */}
            <svg className="absolute w-full h-full transform -rotate-94" viewBox="0 0 36 36">
              <path
                className="text-[#0e0e13]"
                strokeWidth="1.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${progressPct}, 100` }}
                transition={{ duration: 0.4 }}
                className={mode === 'work' ? 'text-[#00f2ff]' : 'text-[#a855f7]'}
                strokeWidth="1.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                style={{ stroke: mode === 'work' ? colorTema : '#a855f7' }}
              />
            </svg>

            {/* Actual textual timer details */}
            <div className="flex flex-col items-center space-y-2 z-10">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] bg-[#111117] border border-[#232330] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                {mode === 'work' ? (
                  <>
                    <Timer size={10} className="text-[#00f2ff]" style={{ color: colorTema }} />
                    Enfoque Mental
                  </>
                ) : (
                  <>
                    <Coffee size={10} className="text-[#a855f7]" />
                    Descanso Cognitivo
                  </>
                )}
              </span>

              <h3 className="font-mono font-light text-white text-5xl md:text-6xl tracking-widest">
                {formatTime(secondsLeft)}
              </h3>

              <p className="font-mono text-[10px] text-[#444455] uppercase mt-2 select-none">
                {isActive ? 'EJECUTANDO CICLO' : 'SISTEMA EN PAUSA'}
              </p>
            </div>
          </div>

          {/* Buttons trigger row */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={resetTimer}
              className="w-12 h-12 rounded-2xl bg-[#0c0c11] border border-[#21212e] text-gray-400 hover:text-white flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={toggleTimer}
              className="px-8 py-3.5 rounded-3xl text-sm font-mono font-bold uppercase tracking-widest text-black shadow-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition cursor-pointer"
              style={{ backgroundColor: colorTema }}
            >
              {isActive ? (
                <>
                  <Pause size={15} fill="currentColor" />
                  Pausar
                </>
              ) : (
                <>
                  <Play size={15} fill="currentColor" />
                  Iniciar
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
