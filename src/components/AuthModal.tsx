import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Mail, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  colorTema: string;
}

export default function AuthModal({ isOpen, onClose, colorTema }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorStatus(null);
    setSuccessStatus(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessStatus('¡Inicio exitoso con Google! Sincronizando datos...');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.warn("Google credentials error:", err);
      // Fallback message for iframe sandbox cases
      if (err.code === 'auth/popup-blocked') {
        setErrorStatus('El navegador bloqueó la ventana de Google. Activa las ventanas emergentes o usa Correo y Contraseña.');
      } else {
        setErrorStatus('Error al conectar con Google. Puedes usar registro por correo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorStatus(null);
    setSuccessStatus(null);

    if (!email || !password) {
      setErrorStatus('Todos los campos obligatorios deben ser cubiertos.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorStatus('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        // Registering a new account
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessStatus('¡Cuenta creada con éxito! Sincronizando...');
      } else {
        // Logging in
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessStatus('¡Sesión establecida! Cargando tus datos...');
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorStatus('Este correo electrónico ya está registrado.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorStatus('Credenciales incorrectas. Verifica tu correo y contraseña.');
      } else if (err.code === 'auth/invalid-credential') {
        setErrorStatus('Datos inválidos. Por favor verifica tus credenciales.');
      } else {
        setErrorStatus('Ocurrió un error inesperado al procesar tu solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glass */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          className="relative w-full max-w-md bg-[#0a0a0f] border border-[#21212c] rounded-2xl shadow-2xl p-6 overflow-hidden z-10 text-[#ededf0]"
        >
          {/* Accent light decoration */}
          <div 
            className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none"
            style={{ backgroundColor: colorTema }}
          />
          <div 
            className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none"
            style={{ backgroundColor: colorTema }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#111116] border border-[#1f1f2e] hover:border-gray-500 hover:text-white text-gray-400 transition cursor-pointer"
            title="Sigue como invitado"
          >
            <X size={15} />
          </button>

          {/* Brand header */}
          <div className="text-center mb-6 space-y-1">
            <div className="flex justify-center mb-2">
              <div 
                className="w-10 h-10 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-center text-cyan-400"
                style={{ color: colorTema, borderColor: `${colorTema}30` }}
              >
                <Sparkles size={18} className="animate-pulse" />
              </div>
            </div>
            <h3 className="font-sans font-bold text-lg text-white">
              {isRegister ? 'Crear Cuenta Sincronizada' : 'Acceso a Focus OS Cloud'}
            </h3>
            <p className="text-xs text-gray-400 font-sans max-w-[280px] mx-auto leading-relaxed">
              Sincroniza tus tareas, notas, agenda, hábitos y finanzas en la nube gratis.
            </p>
          </div>

          {/* Social login buttons */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-10 px-4 rounded-xl bg-[#111116] border border-[#21212b] hover:border-gray-500 hover:bg-[#15151c] flex items-center justify-center gap-2.5 text-xs text-gray-200 hover:text-white transition cursor-pointer font-sans disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38C17,15.5 15,17 12,17c-2.76,0-5-2.24-5-5s2.24-5,5-5c1.23,0,2.35,0.45,3.22,1.2l2-2C15.53,4.71,13.88,4,12,4,7.58,4,4,7.58,4,12s3.58,8,8,8c4.6,0,7.62-3.23,7.62-7.78C19.62,11.75,19.5,11.41,21.35,11.1Z" fill="#FFF"/>
                </g>
              </svg>
              Google
            </button>

            <div className="flex items-center gap-3">
              <span className="h-[1px] bg-[#1a1a24] flex-1" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-gray-500">o por correo</span>
              <span className="h-[1px] bg-[#1a1a24] flex-1" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {isRegister && (
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-gray-500 uppercase">Nombre Completo</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <UserIcon size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Ej. Jonathan Del Ángel"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full bg-[#111116] border border-[#21212b] rounded-xl pl-9.5 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gray-500 font-sans"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] text-gray-500 uppercase">Correo Electrónico</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#111116] border border-[#21212b] rounded-xl pl-9.5 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gray-500 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] text-gray-500 uppercase">Contraseña</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#111116] border border-[#21212b] rounded-xl pl-9.5 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gray-500 font-sans"
                  />
                </div>
              </div>

              {/* Status messages */}
              {errorStatus && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p className="font-sans leading-relaxed">{errorStatus}</p>
                </div>
              )}

              {successStatus && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                  <p className="font-sans leading-relaxed">{successStatus}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-xl bg-white hover:bg-gray-100 text-[#07070a] hover:scale-[1.01] font-sans font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? 'Procesando conexión...' : (isRegister ? 'Crear Cuenta Gratis' : 'Entrar a la Cuenta')}
                <ChevronRight size={14} />
              </button>
            </form>
          </div>

          {/* Prompt options */}
          <div className="mt-5 border-t border-[#14141f] pt-4 flex flex-col items-center gap-2.5">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="font-mono text-[9px] uppercase tracking-wider text-gray-400 hover:text-white transition cursor-pointer"
            >
              {isRegister ? '¿Ya tienes una cuenta? Iniciar Sesión' : '¿No tienes cuenta? Registrate Aquí'}
            </button>

            <button
              onClick={onClose}
              className="font-mono text-[9px] uppercase tracking-wider text-gray-500 hover:text-gray-300 hover:underline transition cursor-pointer mt-1"
            >
              Continuar como Invitado (Sin guardar)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
