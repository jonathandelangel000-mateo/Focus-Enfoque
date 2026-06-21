import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PomodorosViewProps {
  colorTema: string;
  addNotification?: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function PomodorosView({ colorTema, addNotification }: PomodorosViewProps) {
  // Timer durations in minutes
  const [workTime, setWorkTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);

  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio Context & Synthesizers references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundSourcesRef = useRef<{ [key: string]: { source: any; gainNode: GainNode } }>({});
  
  // Track active state of our background focus soundscapes
  const [activeSoundscapes, setActiveSoundscapes] = useState<{ [key: string]: boolean }>({
    rain: false,
    binaural: false,
    space: false
  });

  const startSoundscape = (type: 'rain' | 'binaural' | 'space') => {
    try {
      // Create audio context if it does not exist
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create a specific gain node for this channel to allow fade-in effects
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.connect(ctx.destination);
      
      // Target gain volumes (binaural is quiet, rain and drone should also be relaxing and unobtrusive)
      const targetGain = type === 'binaural' ? 0.05 : type === 'space' ? 0.12 : 0.15;
      gainNode.gain.exponentialRampToValueAtTime(targetGain, ctx.currentTime + 2.0);

      let sourceNode: any;

      if (type === 'rain') {
        // Generate Brown Noise Buffer for authentic heavy rain sound
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // Gain compensation
        }

        const bufferSource = ctx.createBufferSource();
        bufferSource.buffer = buffer;
        bufferSource.loop = true;

        // Add lowpass filter to make it warmer/cozier
        const filterNode = ctx.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(650, ctx.currentTime);

        bufferSource.connect(filterNode);
        filterNode.connect(gainNode);

        bufferSource.start();
        sourceNode = bufferSource;

      } else if (type === 'binaural') {
        // Binaural beats (40Hz difference - Left 180Hz, Right 220Hz)
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        oscLeft.type = 'sine';
        oscLeft.frequency.setValueAtTime(180, ctx.currentTime);
        oscRight.type = 'sine';
        oscRight.frequency.setValueAtTime(220, ctx.currentTime);

        const merger = ctx.createChannelMerger(2);
        
        // Connect to merger (Left/Right separate channels)
        oscLeft.connect(merger, 0, 0);
        oscRight.connect(merger, 0, 1);
        merger.connect(gainNode);

        oscLeft.start();
        oscRight.start();

        // Object proxy containing a manual stop cleanup
        sourceNode = {
          disconnect: () => {
            try {
              oscLeft.stop();
              oscRight.stop();
              oscLeft.disconnect();
              oscRight.disconnect();
              merger.disconnect();
            } catch (e) {}
          }
        } as any;

      } else {
        // Space Engine Drone (Modular Carrier with LFO modulator)
        const carrier = ctx.createOscillator();
        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(90, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.40, ctx.currentTime); // 0.4 Hz cycle

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(14, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(carrier.frequency);

        carrier.connect(filter);
        filter.connect(gainNode);

        carrier.start();
        lfo.start();

        sourceNode = {
          disconnect: () => {
            try {
              carrier.stop();
              lfo.stop();
              carrier.disconnect();
              lfo.disconnect();
              lfoGain.disconnect();
              filter.disconnect();
            } catch (e) {}
          }
        } as any;
      }

      soundSourcesRef.current[type] = { source: sourceNode, gainNode };
      setActiveSoundscapes(prev => ({ ...prev, [type]: true }));

      if (addNotification) {
        addNotification(
          'Atmosfera Iniciada 🎧', 
          `Reproduciendo audio sintético de ${type === 'rain' ? 'Lluvia Profunda' : type === 'binaural' ? 'Ondas Binaurales 40Hz' : 'Motor Cósmico'} en tiempo real.`, 
          'info'
        );
      }

    } catch (e) {
      console.warn("Could not start Web Audio Synthesizer:", e);
    }
  };

  const stopSoundscape = (type: 'rain' | 'binaural' | 'space') => {
    const handle = soundSourcesRef.current[type];
    if (handle) {
      try {
        const ctx = audioCtxRef.current;
        if (ctx) {
          handle.gainNode.gain.cancelScheduledValues(ctx.currentTime);
          handle.gainNode.gain.setValueAtTime(handle.gainNode.gain.value, ctx.currentTime);
          handle.gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2); // Smooth fade-out 
        }
      } catch (e) {}

      setTimeout(() => {
        try {
          if (type === 'rain') {
            (handle.source as AudioBufferSourceNode).stop();
          }
          handle.source.disconnect();
          handle.gainNode.disconnect();
          delete soundSourcesRef.current[type];
          setActiveSoundscapes(prev => ({ ...prev, [type]: false }));
        } catch (e) {}
      }, 1300);
    }
  };

  const toggleSoundscape = (type: 'rain' | 'binaural' | 'space') => {
    if (activeSoundscapes[type]) {
      stopSoundscape(type);
    } else {
      startSoundscape(type);
    }
  };

  // Cleanup synthesizer sound sources on unmount
  useEffect(() => {
    return () => {
      Object.keys(soundSourcesRef.current).forEach(key => {
        try {
          const handle = soundSourcesRef.current[key];
          handle.source.disconnect();
          handle.gainNode.disconnect();
        } catch (e) {}
      });
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(e => {});
      }
    };
  }, []);

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

            // Trigger general console notifications
            if (addNotification) {
              if (mode === 'work') {
                addNotification(
                  'Sesión Completada 🍅', 
                  '¡Excelente concentración! Es momento de tu descanso programado.', 
                  'success'
                );
              } else {
                addNotification(
                  'Regreso al Trabajo 🧠', 
                  'El descanso ha concluido. Prepárate para otra sesión de enfoque.', 
                  'info'
                );
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
  }, [isActive, mode, workTime, breakTime, soundEnabled, addNotification]);

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

          {/* Soundscape Mixer Widget (Punto 2) */}
          <div className="pt-4 border-t border-[#161622] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
                <Volume2 size={11} className="text-[#10b981]" /> Atmosferas de Aislamiento
              </span>
              <span className="font-mono text-[8.5px] text-[#444455] uppercase font-bold tracking-widest">SINTETIZADOR WEB AUDIO</span>
            </div>

            <p className="font-sans text-[11px] text-gray-400 leading-normal">
              Mezcla sonidos binaurales y ruidos de baja frecuencia generados en tiempo real por el navegador para aislar distracciones externas.
            </p>

            <div className="space-y-2 pt-1">
              {/* Rain Soundscape with Brownian Pink noise */}
              <button
                type="button"
                onClick={() => toggleSoundscape('rain')}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs text-left transition duration-200 cursor-pointer ${
                  activeSoundscapes.rain
                    ? 'bg-[rgba(16,185,129,0.08)] border-[#10b981]/40 text-[#10b981]'
                    : 'bg-[#111116] border-[#22222d] text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${activeSoundscapes.rain ? 'bg-[#10b981] animate-pulse' : 'bg-gray-600'}`} />
                  <div className="min-w-0">
                    <span className="font-sans font-medium block truncate">Aguacero de Lluvia</span>
                    <span className="font-mono text-[8px] text-gray-500 block uppercase mt-0.5">Ruido café filtrado</span>
                  </div>
                </div>
                <span className="font-mono text-[8.5px] uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded border border-white/5 shrink-0 ml-2">
                  {activeSoundscapes.rain ? 'ACTIVO' : 'APAGADO'}
                </span>
              </button>

              {/* Binaural Focus beats */}
              <button
                type="button"
                onClick={() => toggleSoundscape('binaural')}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs text-left transition duration-200 cursor-pointer`}
                style={{
                  color: activeSoundscapes.binaural ? colorTema : undefined,
                  borderColor: activeSoundscapes.binaural ? `${colorTema}40` : undefined,
                  backgroundColor: activeSoundscapes.binaural ? `${colorTema}10` : undefined,
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0`} style={{ backgroundColor: activeSoundscapes.binaural ? colorTema : '#4b5563' }} />
                  <div className="min-w-0">
                    <span className="font-sans font-medium block truncate">Enfoque Binaural Beta</span>
                    <span className="font-mono text-[8px] text-gray-500 block uppercase mt-0.5">Ondas cerebrales 40Hz</span>
                  </div>
                </div>
                <span className="font-mono text-[8.5px] uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded border border-white/5 shrink-0 ml-2">
                  {activeSoundscapes.binaural ? 'ACTIVO' : 'APAGADO'}
                </span>
              </button>

              {/* Engine Hum Drone */}
              <button
                type="button"
                onClick={() => toggleSoundscape('space')}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs text-left transition duration-200 cursor-pointer ${
                  activeSoundscapes.space
                    ? 'bg-[rgba(168,85,247,0.08)] border-[#a855f7]/40 text-[#a855f7]'
                    : 'bg-[#111116] border-[#22222d] text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${activeSoundscapes.space ? 'bg-[#a855f7] animate-pulse' : 'bg-gray-600'}`} />
                  <div className="min-w-0">
                    <span className="font-sans font-medium block truncate">Hum de Motor Cósmico</span>
                    <span className="font-mono text-[8px] text-gray-500 block uppercase mt-0.5">Drone modular de baja frec</span>
                  </div>
                </div>
                <span className="font-mono text-[8.5px] uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded border border-white/5 shrink-0 ml-2">
                  {activeSoundscapes.space ? 'ACTIVO' : 'APAGADO'}
                </span>
              </button>
            </div>
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
