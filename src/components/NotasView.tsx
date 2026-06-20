import { useState, FormEvent } from 'react';
import { Note } from '../types';
import { FileText, Plus, Trash2, Search, CheckCircle2, Bookmark, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotasViewProps {
  notes: Note[];
  setNotes: (notes: Note[] | ((prev: Note[]) => Note[])) => void;
  colorTema: string;
}

export default function NotasView({ notes, setNotes, colorTema }: NotasViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [isQuote, setIsQuote] = useState(false);

  const categories = ['General', 'Filosofía', 'Proyectos', 'Finanzas', 'Rutina'];

  const handleAddNote = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isQuote: isQuote
    };

    setNotes(prev => [newNote, ...prev]);
    setNewTitle('');
    setNewContent('');
    setIsQuote(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                rows={5}
                placeholder="Escribe tus ideas, reflexiones o pon una cita textual..."
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-all font-sans"
              />
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
                  className="bg-[#0a0a0f] border border-[#161622] rounded-2xl p-5 hover:border-gray-700 transition flex flex-col justify-between h-56 relative group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="font-mono text-[8px] uppercase tracking-widest text-[#888892] bg-[#111116] border border-[#22222a] px-2 py-0.5 rounded">
                        {note.category}
                      </span>
                      {note.isQuote && (
                        <span className="font-mono text-[8px] text-amber-500 bg-amber-500/10 border border-amber-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles size={8} /> FRASE DEL DÍA
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-sans font-semibold text-white text-sm mb-2.5 leading-snug">
                      {note.title}
                    </h4>

                    <p className="font-sans font-light text-xs text-gray-400 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>

                  <div className="border-t border-[#13131b] pt-3 mt-4 flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span>⏱️ {note.createdAt}</span>
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
