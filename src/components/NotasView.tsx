import { useState, FormEvent } from 'react';
import { Note } from '../types';
import { FileText, Plus, Trash2, Search, CheckCircle2, Bookmark, Sparkles, Pin, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotasViewProps {
  notes: Note[];
  setNotes: (notes: Note[] | ((prev: Note[]) => Note[])) => void;
  colorTema: string;
  addNotification?: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function NotasView({ notes, setNotes, colorTema, addNotification }: NotasViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [isQuote, setIsQuote] = useState(false);
  const [noteColor, setNoteColor] = useState('#64748b'); // default Slate

  // Copy success status state
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const categories = ['General', 'Filosofía', 'Proyectos', 'Finanzas', 'Rutina'];
  const themeColors = [
    { name: 'Gris', value: '#64748b' },
    { name: 'Esmeralda', value: '#10b981' },
    { name: 'Zafiro', value: '#3b82f6' },
    { name: 'Amatista', value: '#a855f7' },
    { name: 'Ámbar', value: '#f59e0b' },
    { name: 'Rosa', value: '#f43f5e' }
  ];

  const handleAddNote = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isQuote: isQuote,
      isPinned: false,
      colorCode: noteColor
    };

    setNotes(prev => [newNote, ...prev]);
    if (addNotification) {
      addNotification('Pensamiento Capturado 🧠', `Se guardó tu nota: "${newNote.title}"`, 'success');
    }
    setNewTitle('');
    setNewContent('');
    setIsQuote(false);
    setNoteColor('#64748b');
  };

  const handleDeleteNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (note && addNotification) {
      addNotification('Nota Eliminada 🗑️', `El registro "${note.title}" se borró de la bitácora.`, 'info');
    }
  };

  const handleTogglePinNote = (id: string) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const nextPin = !n.isPinned;
      if (addNotification) {
        addNotification(
          nextPin ? 'Nota Fijada 📌' : 'Nota Desanclada 🔄', 
          `"${n.title}" ahora ${nextPin ? 'figurará al principio de tu bitácora' : 'volverá al orden cronológico'}.`, 
          'success'
        );
      }
      return { ...n, isPinned: nextPin };
    }));
  };

  const handleCopyNoteText = (note: Note) => {
    try {
      const shareableText = `${note.title}\n[Categoría: ${note.category}]\n\n${note.content}\n\n— Escrito en Focus OS el ${note.createdAt}`;
      navigator.clipboard.writeText(shareableText);
      setCopiedNoteId(note.id);
      if (addNotification) {
        addNotification('Copiado al Portapapeles 📋', 'La nota ha sido formateada y copiada con éxito.', 'success');
      }
      setTimeout(() => setCopiedNoteId(null), 2500);
    } catch (e) {
      console.warn("Clipboard access denied", e);
    }
  };

  const filteredNotes = notes
    .filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then cron order descending
      return b.id.localeCompare(a.id);
    });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="border-b border-[#16161a] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#888892]">
            CONOCIMIENTO Y FILOSOFÍA
          </span>
          <h2 className="font-sans font-light text-white text-3xl tracking-tight mt-1">
            Mis Notas y <span className="font-medium">Enfoques</span>
          </h2>
        </div>
        
        {/* Search bar */}
        <div className="relative md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar enfoques o frases..."
            className="w-full bg-[#111116] border border-[#23232c] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-gray-500 font-mono transition-all"
          />
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form panel (4 cols) */}
        <div className="lg:col-span-4 bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6 space-y-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
            <Plus size={12} className="text-[#00f2ff]" /> Redactar Nota
          </span>

          <form onSubmit={handleAddNote} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase">Título de la Nota</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ej. Estoicismo elemental..."
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase">Categoría</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-gray-500 transition-all font-mono"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase">Contenido</label>
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                rows={4}
                placeholder="Escribe tus ideas, reflexiones o pon una cita textual..."
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-all font-sans"
              />
            </div>

            {/* Note Color selection dots */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase block">Color Temático de Enfoque</label>
              <div className="flex items-center gap-2.5 py-1">
                {themeColors.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNoteColor(color.value)}
                    className="w-6 h-6 rounded-full border transition-all cursor-pointer relative flex items-center justify-center shrink-0"
                    style={{ 
                      backgroundColor: color.value,
                      borderColor: noteColor === color.value ? '#ffffff' : 'rgba(255,255,255,0.15)',
                      boxShadow: noteColor === color.value ? `0 0 10px ${color.value}` : 'none'
                    }}
                    title={color.name}
                  >
                    {noteColor === color.value && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quote Toggle */}
            <div className="bg-[#111116]/50 border border-[#1b1b24] p-3 rounded-xl flex items-start gap-3">
              <input
                id="quote-mode-cb"
                type="checkbox"
                checked={isQuote}
                onChange={e => setIsQuote(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-700 bg-black text-[#00f2ff] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="quote-mode-cb" className="cursor-pointer select-none">
                <span className="font-mono text-[10px] text-white uppercase font-bold tracking-wider block">
                  Cita Inspiradora (Frónesis)
                </span>
                <span className="text-[10px] text-[#888892] font-light mt-0.5 block leading-relaxed">
                  Activa esta casilla para incluir esta nota en el carrusel de frases rotativas de inicio.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-black transition-all shadow-lg cursor-pointer"
              style={{ backgroundColor: colorTema }}
            >
              Fijar Nota
            </button>
          </form>
        </div>

        {/* Notes Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#888892] px-1 block mb-1">
            Archivos Memorizados ({filteredNotes.length})
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map(note => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#0a0a0f] border border-[#161622] rounded-2xl p-5 hover:border-gray-700 transition flex flex-col justify-between h-56 relative group overflow-hidden"
                  style={{ 
                    borderLeft: note.colorCode ? `4px solid ${note.colorCode}` : undefined 
                  }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[8px] uppercase tracking-widest text-[#888892] bg-[#111116] border border-[#22222a] px-2 py-0.5 rounded truncate">
                          {note.category}
                        </span>
                        {note.isPinned && (
                          <span className="text-[#00f2ff] flex items-center shrink-0" style={{ color: colorTema }}>
                            <Pin size={10} className="transform rotate-45" />
                          </span>
                        )}
                        {note.isQuote && (
                          <span className="font-mono text-[7px] text-amber-500 bg-amber-500/5 border border-amber-500/10 px-1 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                            ★ FRASE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-30 group-hover:opacity-100 transition shrink-0">
                        <button
                          onClick={() => handleTogglePinNote(note.id)}
                          className={`p-1 rounded transition hover:bg-white/5 cursor-pointer ${note.isPinned ? 'text-amber-400' : 'text-gray-500'}`}
                          title={note.isPinned ? 'Desanclar Nota' : 'Fijar nota al inicio'}
                        >
                          <Pin size={11} className={note.isPinned ? '' : 'transform rotate-45'} />
                        </button>
                        <button
                          onClick={() => handleCopyNoteText(note)}
                          className="p-1 rounded transition hover:bg-white/5 text-gray-500 hover:text-white cursor-pointer"
                          title="Copiar texto"
                        >
                          {copiedNoteId === note.id ? (
                            <Check size={11} className="text-emerald-400" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="font-sans font-semibold text-white text-sm mb-1 line-clamp-1 leading-snug">
                      {note.title}
                    </h4>

                    <p className="font-sans font-light text-xs text-gray-400 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>

                  <div className="border-t border-[#13131b] pt-3 mt-3 flex items-center justify-between text-[10px] font-mono text-gray-300">
                    <span className="text-gray-500">⏱️ {note.createdAt}</span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-500 hover:text-red-500 p-1 rounded hover:bg-red-500/5 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredNotes.length === 0 && (
              <div className="col-span-2 text-center py-16 bg-[#08080b]/60 rounded-2xl border border-dashed border-[#1a1a26]">
                <FileText className="mx-auto text-gray-600 mb-3" size={32} />
                <p className="font-sans font-light text-sm text-gray-500 italic">
                  No se encontraron notas en tu colección.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
