import { useState, useEffect, ChangeEvent, useCallback } from 'react';
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
  Minimize2,
  Menu,
  Bell,
  BellOff,
  Trash,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Info
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
import AuthModal from './components/AuthModal';

// Seed data
import { 
  INITIAL_NOTES, 
  INITIAL_TASKS, 
  INITIAL_HABITS, 
  INITIAL_EVENTS, 
  INITIAL_EXPENSES, 
  INITIAL_QUOTES 
} from './seedData';

import { Note, Task, Habit, AgendaEvent, Expense, Quote, AppNotification } from './types';
import { 
  auth, 
  db, 
  validateFirebaseConnection, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from './firebase';
import { 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  getCountFromServer,
  writeBatch
} from 'firebase/firestore';



const PRESET_AVATARS = [
  { name: 'Ciber Punk', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=256&auto=format&fit=crop' },
  { name: 'Astronauta', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256&auto=format&fit=crop' },
  { name: 'Abstracto', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=256&auto=format&fit=crop' },
  { name: 'Zen', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=256&auto=format&fit=crop' },
  { name: 'Diseñadora', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop' }
];

const playNotifySound = (type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'success') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'triangle';
      osc2.type = 'sine';
      
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc1.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc1.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
      
      osc2.frequency.setValueAtTime(1046.50, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.5);
    } else if (type === 'warning' || type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(330, ctx.currentTime); // E4
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.35); // A3
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (err) {
    console.warn("AudioContext playback blocked / failed", err);
  }
};

export default function App() {
  // Current active navigation section
  const [currentSection, setCurrentSection] = useState('inicio');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : true;
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('focus_theme_mode') as 'dark' | 'light') || 'dark';
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('focus_notifications');
      if (stored) return JSON.parse(stored);
      
      // Seed initial notifications for a live experience
      const initial: AppNotification[] = [
        {
          id: 'welcome',
          title: 'Sistema Focus OS Establecido',
          body: 'Consola cognitiva configurada. Los módulos de Tareas, Rutinas y Agenda están sincronizados de forma inteligente.',
          timestamp: 'Ahora mismo',
          read: false,
          type: 'success'
        },
        {
          id: 'seed-sync',
          title: 'Sincronizador Activo',
          body: 'El motor integrado monitoreará tu agenda y tareas para enviarte alertas push en tiempo real.',
          timestamp: 'Hace 5 min',
          read: true,
          type: 'info'
        }
      ];
      localStorage.setItem('focus_notifications', JSON.stringify(initial));
      return initial;
    }
    return [];
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('focus_notifications_enabled') !== 'false';
    }
    return true;
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('focus_sound_enabled') !== 'false';
    }
    return true;
  });

  const [webNotificationsPermission, setWebNotificationsPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const triggerAddNotification = useCallback((title: string, body: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    if (!notificationsEnabled) return;

    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      body,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50);
      localStorage.setItem('focus_notifications', JSON.stringify(updated));
      return updated;
    });

    if (soundEnabled) {
      playNotifySound(type);
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch (err) {
        console.warn("Could not display native notification", err);
      }
    }
  }, [notificationsEnabled, soundEnabled]);

  const requestWebNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setWebNotificationsPermission(permission);
      if (permission === 'granted') {
        triggerAddNotification('Permiso Concedido 🔔', 'Ahora recibirás alertas de escritorio nativas en tu pantalla.', 'success');
      }
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('focus_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('focus_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('focus_notifications', JSON.stringify([]));
  };

  const toggleNotificationsEnabled = () => {
    setNotificationsEnabled(prev => {
      const next = !prev;
      localStorage.setItem('focus_notifications_enabled', String(next));
      return next;
    });
  };

  const toggleSoundEnabled = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('focus_sound_enabled', String(next));
      return next;
    });
  };


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

  // Firebase Auth states
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [totalUsersRegistered, setTotalUsersRegistered] = useState(0);

  // User details matching existing structure: focus_user
  const [user, setUser] = useState({
    name: 'Usuario',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
    role: 'Master Optimizer'
  });

  // Theme accent matching: focus_color_tema
  const [colorTema, setColorTema] = useState('#00f2ff');

  // Helper to fetch global registered user count
  const refreshRegisteredCount = useCallback(async () => {
    try {
      const coll = collection(db, 'users');
      const snapshot = await getCountFromServer(coll);
      setTotalUsersRegistered(snapshot.data().count || 0);
    } catch (e) {
      console.warn("Failed fetching total user count", e);
    }
  }, []);

  // Sync Cloud Data to States
  const syncCloudData = useCallback(async (userId: string) => {
    try {
      // Load Tasks
      const qTasks = query(collection(db, 'tasks'), where('userId', '==', userId));
      const sTasks = await getDocs(qTasks);
      let cloudTasks: Task[] = [];
      sTasks.forEach(doc => { cloudTasks.push(doc.data() as Task); });
      
      if (cloudTasks.length > 0) {
        setTasks(cloudTasks);
        localStorage.setItem('focus_tasks', JSON.stringify(cloudTasks));
      } else if (tasks.length > 0) {
        const batch = writeBatch(db);
        tasks.forEach(t => {
          const docRef = doc(db, 'tasks', t.id);
          batch.set(docRef, { ...t, userId });
        });
        await batch.commit();
      }

      // Load Notes
      const qNotes = query(collection(db, 'notes'), where('userId', '==', userId));
      const sNotes = await getDocs(qNotes);
      let cloudNotes: Note[] = [];
      sNotes.forEach(doc => { cloudNotes.push(doc.data() as Note); });
      
      if (cloudNotes.length > 0) {
        setNotes(cloudNotes);
        localStorage.setItem('focus_notes', JSON.stringify(cloudNotes));
      } else if (notes.length > 0) {
        const batch = writeBatch(db);
        notes.forEach(n => {
          const docRef = doc(db, 'notes', n.id);
          batch.set(docRef, { ...n, userId });
        });
        await batch.commit();
      }

      // Load Habits
      const qHabits = query(collection(db, 'habits'), where('userId', '==', userId));
      const sHabits = await getDocs(qHabits);
      let cloudHabits: Habit[] = [];
      sHabits.forEach(doc => { cloudHabits.push(doc.data() as Habit); });
      
      if (cloudHabits.length > 0) {
        setHabits(cloudHabits);
        localStorage.setItem('focus_habits', JSON.stringify(cloudHabits));
      } else if (habits.length > 0) {
        const batch = writeBatch(db);
        habits.forEach(h => {
          const docRef = doc(db, 'habits', h.id);
          batch.set(docRef, { ...h, userId });
        });
        await batch.commit();
      }

      // Load Events
      const qEvents = query(collection(db, 'events'), where('userId', '==', userId));
      const sEvents = await getDocs(qEvents);
      let cloudEvents: AgendaEvent[] = [];
      sEvents.forEach(doc => { cloudEvents.push(doc.data() as AgendaEvent); });
      
      if (cloudEvents.length > 0) {
        setEvents(cloudEvents);
        localStorage.setItem('focus_events', JSON.stringify(cloudEvents));
      } else if (events.length > 0) {
        const batch = writeBatch(db);
        events.forEach(ev => {
          const docRef = doc(db, 'events', ev.id);
          batch.set(docRef, { ...ev, userId });
        });
        await batch.commit();
      }

      // Load Expenses
      const qExpenses = query(collection(db, 'expenses'), where('userId', '==', userId));
      const sExpenses = await getDocs(qExpenses);
      let cloudExpenses: Expense[] = [];
      sExpenses.forEach(doc => { cloudExpenses.push(doc.data() as Expense); });
      
      if (cloudExpenses.length > 0) {
        setExpenses(cloudExpenses);
        localStorage.setItem('focus_expenses', JSON.stringify(cloudExpenses));
      } else if (expenses.length > 0) {
        const batch = writeBatch(db);
        expenses.forEach(ex => {
          const docRef = doc(db, 'expenses', ex.id);
          batch.set(docRef, { ...ex, userId });
        });
        await batch.commit();
      }
    } catch (e) {
      console.error("Cloud syncing failed:", e);
    }
  }, [tasks, notes, habits, events, expenses]);

  // Auth subscription
  useEffect(() => {
    validateFirebaseConnection();
    
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      setLoadingAuth(false);
      
      if (fUser) {
        const userDocRef = doc(db, 'users', fUser.uid);
        let userDocSnap;
        try {
          userDocSnap = await getDoc(userDocRef);
        } catch (err) {
          console.warn("Could not fetch user document (permissions/offline)", err);
        }
        
        const nowStr = new Date().toISOString();
        const userData = {
          uid: fUser.uid,
          email: fUser.email || '',
          displayName: fUser.displayName || fUser.email?.split('@')[0] || 'Enfocado',
          photoURL: fUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
          lastLoginAt: nowStr,
          createdAt: (userDocSnap && userDocSnap.exists()) ? (userDocSnap.data().createdAt || nowStr) : nowStr
        };
        
        try {
          await setDoc(userDocRef, userData, { merge: true });
        } catch (err) {
          console.warn("Could not write user profile to database", err);
        }
        
        setUser({
          name: userData.displayName,
          photo: userData.photoURL,
          role: 'Mente Enfoque Sincronizada ⚡'
        });
        localStorage.setItem('focus_user', JSON.stringify({
          name: userData.displayName,
          photo: userData.photoURL,
          role: 'Mente Enfoque Sincronizada ⚡'
        }));
        
        await refreshRegisteredCount();
        await syncCloudData(fUser.uid);
        
        triggerAddNotification(
          `¡Bienvenido, ${userData.displayName}! 👋`, 
          'Tus datos han sido sincronizados con el espacio en la nube de Focus OS.', 
          'success'
        );
      } else {
        const storageUser = localStorage.getItem('focus_user');
        if (storageUser) {
          try {
            const parsed = JSON.parse(storageUser);
            if (parsed.role === 'Mente Enfoque Sincronizada ⚡') {
              setUser({
                name: 'Usuario Invitado',
                photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
                role: 'Invitado Local (Sin Nube)'
              });
            }
          } catch(e) {}
        }
        await refreshRegisteredCount();
      }
    });

    return () => unsubscribe();
  }, [triggerAddNotification, refreshRegisteredCount, syncCloudData]);

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

  // Sync state modifications to LocalStorage and Firestore
  const updateAndPersistNotes = async (newN: any) => {
    if (!auth.currentUser) {
      setShowAuthModal(true);
      triggerAddNotification('Sincronización Mandatoria 🔒', 'Por favor, regístrate o inicia sesión para poder guardar o modificar tus notas.', 'warning');
      return;
    }
    const prev = notes;
    const updated = typeof newN === 'function' ? newN(prev) : newN;
    setNotes(updated);
    localStorage.setItem('focus_notes', JSON.stringify(updated));

    const userId = auth.currentUser.uid;
    const updatedIds = new Set(updated.map((n: Note) => n.id));

    try {
      for (const n of updated) {
        const prevItem = prev.find(p => p.id === n.id);
        if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(n)) {
          await setDoc(doc(db, 'notes', n.id), { ...n, userId });
        }
      }

      for (const id of prev.map(n => n.id)) {
        if (!updatedIds.has(id)) {
          await deleteDoc(doc(db, 'notes', id));
        }
      }
    } catch (e) {
      console.warn("Firestore notes sync failed (permissions/offline)", e);
    }
  };

  const updateAndPersistTasks = async (newT: any) => {
    if (!auth.currentUser) {
      setShowAuthModal(true);
      triggerAddNotification('Sincronización Mandatoria 🔒', 'Por favor, regístrate o inicia sesión para poder guardar o modificar tus tareas.', 'warning');
      return;
    }
    const prev = tasks;
    const updated = typeof newT === 'function' ? newT(prev) : newT;
    setTasks(updated);
    localStorage.setItem('focus_tasks', JSON.stringify(updated));

    const userId = auth.currentUser.uid;
    const updatedIds = new Set(updated.map((t: Task) => t.id));

    try {
      for (const t of updated) {
        const prevItem = prev.find(p => p.id === t.id);
        if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(t)) {
          await setDoc(doc(db, 'tasks', t.id), { ...t, userId });
        }
      }

      for (const id of prev.map(t => t.id)) {
        if (!updatedIds.has(id)) {
          await deleteDoc(doc(db, 'tasks', id));
        }
      }
    } catch (e) {
      console.warn("Firestore tasks sync failed", e);
    }
  };


  const updateAndPersistHabits = async (newH: any) => {
    if (!auth.currentUser) {
      setShowAuthModal(true);
      triggerAddNotification('Sincronización Mandatoria 🔒', 'Por favor, regístrate o inicia sesión para poder guardar o modificar tus hábitos.', 'warning');
      return;
    }
    const prev = habits;
    const updated = typeof newH === 'function' ? newH(prev) : newH;
    setHabits(updated);
    localStorage.setItem('focus_habits', JSON.stringify(updated));

    const userId = auth.currentUser.uid;
    const updatedIds = new Set(updated.map((h: Habit) => h.id));

    try {
      for (const h of updated) {
        const prevItem = prev.find(p => p.id === h.id);
        if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(h)) {
          await setDoc(doc(db, 'habits', h.id), { ...h, userId });
        }
      }

      for (const id of prev.map(h => h.id)) {
        if (!updatedIds.has(id)) {
          await deleteDoc(doc(db, 'habits', id));
        }
      }
    } catch (e) {
      console.warn("Firestore habits sync failed", e);
    }
  };

  const updateAndPersistEvents = async (newE: any) => {
    if (!auth.currentUser) {
      setShowAuthModal(true);
      triggerAddNotification('Sincronización Mandatoria 🔒', 'Por favor, regístrate o inicia sesión para poder guardar u organizar tu agenda.', 'warning');
      return;
    }
    const prev = events;
    const updated = typeof newE === 'function' ? newE(prev) : newE;
    setEvents(updated);
    localStorage.setItem('focus_events', JSON.stringify(updated));

    const userId = auth.currentUser.uid;
    const updatedIds = new Set(updated.map((ev: AgendaEvent) => ev.id));

    try {
      for (const ev of updated) {
        const prevItem = prev.find(p => p.id === ev.id);
        if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(ev)) {
          await setDoc(doc(db, 'events', ev.id), { ...ev, userId });
        }
      }

      for (const id of prev.map(ev => ev.id)) {
        if (!updatedIds.has(id)) {
          await deleteDoc(doc(db, 'events', id));
        }
      }
    } catch (e) {
      console.warn("Firestore events sync failed", e);
    }
  };

  const updateAndPersistExpenses = async (newEx: any) => {
    if (!auth.currentUser) {
      setShowAuthModal(true);
      triggerAddNotification('Sincronización Mandatoria 🔒', 'Por favor, regístrate o inicia sesión para poder registrar o borrar gastos.', 'warning');
      return;
    }
    const prev = expenses;
    const updated = typeof newEx === 'function' ? newEx(prev) : newEx;
    setExpenses(updated);
    localStorage.setItem('focus_expenses', JSON.stringify(updated));

    const userId = auth.currentUser.uid;
    const updatedIds = new Set(updated.map((ex: Expense) => ex.id));

    try {
      for (const ex of updated) {
        const prevItem = prev.find(p => p.id === ex.id);
        if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(ex)) {
          await setDoc(doc(db, 'expenses', ex.id), { ...ex, userId });
        }
      }

      for (const id of prev.map(ex => ex.id)) {
        if (!updatedIds.has(id)) {
          await deleteDoc(doc(db, 'expenses', id));
        }
      }
    } catch (e) {
      console.warn("Firestore expenses sync failed", e);
    }
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
            addNotification={triggerAddNotification}
          />
        );
      case 'tareas':
        return (
          <TareasView 
            tasks={tasks}
            setTasks={updateAndPersistTasks}
            colorTema={colorTema}
            addNotification={triggerAddNotification}
          />
        );
      case 'notas':
        return (
          <NotasView 
            notes={notes}
            setNotes={updateAndPersistNotes}
            colorTema={colorTema}
            addNotification={triggerAddNotification}
          />
        );
      case 'agenda':
        return (
          <AgendaView 
            events={events}
            setEvents={updateAndPersistEvents}
            colorTema={colorTema}
            addNotification={triggerAddNotification}
          />
        );
      case 'rutina':
        return (
          <RutinaView 
            habits={habits}
            setHabits={updateAndPersistHabits}
            tasks={tasks}
            setTasks={updateAndPersistTasks}
            events={events}
            setEvents={updateAndPersistEvents}
            colorTema={colorTema}
            addNotification={triggerAddNotification}
          />
        );
      case 'pomodoros':
        return (
          <PomodorosView 
            colorTema={colorTema}
            addNotification={triggerAddNotification}
          />
        );
      case 'gastos':
        return (
          <GastosView 
            expenses={expenses}
            setExpenses={updateAndPersistExpenses}
            colorTema={colorTema}
            addNotification={triggerAddNotification}
          />
        );
      case 'juego':
        return (
          <FocusBirdView 
            colorTema={colorTema}
            addNotification={triggerAddNotification}
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
        <header className="h-[76px] bg-[#08080c]/80 backdrop-blur-md border-b border-[#14141a] px-4 md:px-8 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-3">
            {/* Botón de menú para móviles */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="md:hidden p-2 rounded-xl bg-[#111116] border border-[#21212b] text-gray-400 hover:text-white transition cursor-pointer flex items-center justify-center shrink-0"
              title="Alternar menú"
            >
              <Menu size={16} />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorTema }} />
              <span className="font-mono text-[9px] min-[380px]:text-xs uppercase tracking-widest text-[#888892] select-none">
                VÍNCULO COGNITIVO ACTIVO
              </span>
            </div>
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

            {/* Botón de Notificaciones bell badge */}
            <button
              onClick={() => setShowNotificationsPanel(true)}
              className="p-2.5 rounded-xl bg-[#111116] border border-[#21212b] hover:border-gray-500 hover:text-white text-gray-400 transition cursor-pointer relative"
              title="Alertas de consola"
            >
              {notifications.filter(notif => !notif.read).length > 0 ? (
                <>
                  <Bell size={16} className="animate-wiggle text-white" style={{ color: colorTema }} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-550 rounded-full animate-ping" style={{ backgroundColor: colorTema }} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: colorTema }} />
                </>
              ) : (
                <Bell size={16} />
              )}
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
        <main className="flex-1 overflow-y-auto w-full relative z-10 px-4 py-4 md:px-8 md:py-8 custom-scrollbar">
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
              className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-[#0a0a0f] border-l border-[#1a1a24] z-50 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar"
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
                  <div className="bg-[#111118]/90 border border-[#21212b] rounded-xl p-3.5 space-y-3.5">
                    <span className="font-mono text-[8px] uppercase tracking-widest text-[#888892] block">CONEXIÓN A LA NUBE</span>
                    {firebaseUser ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-mono text-emerald-400">NUBE ACTIVA Y SINCRO ✓</span>
                        </div>
                        <p className="text-xs text-gray-400 font-sans truncate">
                          Cuenta: <span className="text-gray-250 font-medium">{firebaseUser.email}</span>
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              await signOut(auth);
                              triggerAddNotification('Sesión finalizada 🚪', 'Has salido de tu cuenta de forma segura.', 'info');
                            } catch (e) {
                              console.error("Logout failed", e);
                            }
                          }}
                          className="w-full py-2 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 hover:border-red-600/50 rounded-lg text-xs font-mono uppercase tracking-wider transition cursor-pointer"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[11px] font-mono text-amber-500">MODO INVITADO LOCAL</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                          Tus progresos se guardan en el navegador. Inicia sesión para guardar en la nube.
                        </p>
                        <button
                          onClick={() => {
                            setShowSettingsModal(false);
                            setShowAuthModal(true);
                          }}
                          className="w-full py-2 bg-[#12121e] hover:bg-white/5 text-xs text-white border border-[#262638] rounded-lg font-mono uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1"
                          style={{ borderColor: colorTema }}
                        >
                          <Sparkles size={11} className="text-cyan-400" style={{ color: colorTema }} />
                          Iniciar Sesión / Logear
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] block pt-2">Detalles del Operador</span>
                  
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

      {/* Notifications slide-out drawer */}
      <AnimatePresence>
        {showNotificationsPanel && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotificationsPanel(false)}
              className="absolute inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Slide menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-[#0a0a0f] border-l border-[#1a1a24] z-50 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#14141f] pb-4">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-[#00f2ff]" style={{ color: colorTema }} />
                    <h3 className="font-sans font-semibold text-lg text-white">
                      Centro de Alertas
                    </h3>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button 
                        onClick={markAllNotificationsAsRead}
                        className="p-1 px-2 rounded hover:bg-[#1a1a24] text-gray-400 hover:text-white transition cursor-pointer text-[10px] font-mono uppercase border border-gray-800"
                      >
                        Leídos ✓
                      </button>
                    )}
                    <button 
                      onClick={() => setShowNotificationsPanel(false)}
                      className="p-1 rounded-lg hover:bg-[#1a1a24] text-gray-400 hover:text-white transition cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Notifications configurations */}
                <div className="bg-[#111118]/80 border border-[#1b1b26] rounded-xl p-3.5 space-y-3">
                  <span className="font-mono text-[8px] tracking-widest uppercase text-gray-500 block">CONFIGURACIÓN DE ALERTAS</span>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-sans">Permitir Notificaciones</span>
                    <button 
                      onClick={toggleNotificationsEnabled}
                      className={`w-8 h-4.5 rounded-full relative transition-colors duration-200 cursor-pointer ${notificationsEnabled ? 'bg-cyan-500' : 'bg-gray-800'}`}
                      style={{ backgroundColor: notificationsEnabled ? colorTema : undefined }}
                    >
                      <span className={`absolute top-0.5 left-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform duration-200 ${notificationsEnabled ? 'translate-x-3.5' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-300 font-sans">Alertas de Audio Sintetizadas</span>
                    <button 
                      onClick={toggleSoundEnabled}
                      className={`w-8 h-4.5 rounded-full relative transition-colors duration-200 cursor-pointer ${soundEnabled ? 'outline-none' : 'bg-gray-800'}`}
                      style={{ backgroundColor: soundEnabled ? colorTema : '#1f2937' }}
                    >
                      <span className={`absolute top-0.5 left-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform duration-200 ${soundEnabled ? 'translate-x-3.5' : ''}`} />
                    </button>
                  </div>

                  {'Notification' in window && (
                    <div className="pt-2 border-t border-[#13131d] flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400 font-light">Push Nativo (Escritorio)</span>
                        <span className="font-mono text-[8.5px] uppercase" style={{ color: webNotificationsPermission === 'granted' ? '#10b981' : '#f59e0b' }}>
                          {webNotificationsPermission === 'granted' ? 'Concedido' : 'Desactivado'}
                        </span>
                      </div>
                      {webNotificationsPermission !== 'granted' && (
                        <button
                          onClick={requestWebNotificationPermission}
                          className="w-full py-1 bg-[#161624] hover:bg-[#1b1b2d] text-white border border-[#232336] rounded-md font-mono text-[8px] uppercase tracking-wider transition cursor-pointer"
                        >
                          Solicitar Permisos Push Nativo
                        </button>
                      )}
                    </div>
                  )}

                  {/* Registered Users Count Recount */}
                  <div className="pt-2 border-t border-[#13131d] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-light">Mentes Conectadas en la Web:</span>
                      <span className="font-mono text-[11px] font-bold text-cyan-400" style={{ color: colorTema }}>
                        {totalUsersRegistered} {totalUsersRegistered === 1 ? 'Mente' : 'Mentes'}
                      </span>
                    </div>
                  </div>

                  {/* Test notification button */}
                  <div className="pt-1.55">
                    <button
                      onClick={() => triggerAddNotification('Prueba de Sistema 🧪', '¡La notificación auditiva y visual funciona a la perfección!', 'success')}
                      className="w-full py-1 border border-dashed border-[#222] hover:border-gray-500 text-gray-400 hover:text-white rounded-md font-mono text-[8.5px] uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Sparkles size={9} /> Probar Alerta Sintetizada
                    </button>
                  </div>
                </div>

                {/* Notifications List Log */}
                <div className="space-y-3">
                  <span className="font-mono text-[8px] tracking-widest uppercase text-gray-500 block">HISTORIAL COGNITIVO ({notifications.length})</span>

                  {notifications.length === 0 ? (
                    <div className="text-center py-10 text-gray-650 font-sans text-xs italic">
                      Historial libre de distracciones. No hay alertas registradas.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                      {notifications.map((notif) => {
                        return (
                          <div 
                            key={notif.id} 
                            className={`p-3 rounded-xl border transition relative flex gap-2.5 items-start ${
                              notif.read ? 'bg-[#0a0a0f]/40 border-[#14141c]' : 'bg-[#111116] border-[#1f1f2e] shadow-lg shadow-cyan-950/5'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {notif.type === 'success' && <CheckCircle2 size={13} className="text-emerald-400" />}
                              {notif.type === 'warning' && <AlertTriangle size={13} className="text-amber-400" />}
                              {notif.type === 'error' && <AlertTriangle size={13} className="text-red-400" />}
                              {notif.type === 'info' && <Info size={13} className="text-[#00f2ff]" style={{ color: colorTema }} />}
                            </div>

                            <div className="flex-1 pr-4 min-w-0">
                              <h4 className={`font-sans font-bold text-xs leading-tight ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                                {notif.title}
                              </h4>
                              <p className="text-[11px] text-gray-400 font-light leading-relaxed mt-0.5">
                                {notif.body}
                              </p>
                              <span className="font-mono text-[7.5px] text-[#444452] uppercase mt-2 block">
                                ⏱️ {notif.timestamp}
                              </span>
                            </div>

                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="absolute top-2 right-2 p-0.5 rounded hover:bg-[#1a1a24] text-gray-500 hover:text-white transition cursor-pointer"
                              title="Borrar alerta"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer footer clear log option */}
              {notifications.length > 0 && (
                <div className="pt-4 border-t border-[#14141f]">
                  <button
                    onClick={clearAllNotifications}
                    className="w-full py-2 px-4 rounded-xl bg-red-950/5 hover:bg-red-950/10 border border-[#2b191c] hover:border-red-500/30 text-[#ff8080] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Trash size={12} /> Borrar Todo el Historial
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        colorTema={colorTema} 
      />

    </div>
  );
}
