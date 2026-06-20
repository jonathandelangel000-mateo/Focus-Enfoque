import { useState, FormEvent } from 'react';
import { Expense } from '../types';
import { DollarSign, Plus, Trash2, CalendarDays, BarChart4, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GastosViewProps {
  expenses: Expense[];
  setExpenses: (expenses: Expense[] | ((prev: Expense[]) => Expense[])) => void;
  colorTema: string;
}

export default function GastosView({ expenses, setExpenses, colorTema }: GastosViewProps) {
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Productividad');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = ['Productividad', 'Alimentación', 'Servicios', 'Educación', 'Estilo de Vida', 'Otros'];

  const handleAddExpense = (e: FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newAmount) return;

    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      description: newDesc.trim(),
      amount: parseFloat(newAmount),
      category: newCategory,
      date: newDate
    };

    setExpenses(prev => [newExp, ...prev].sort((a,b) => b.date.localeCompare(a.date)));
    setNewDesc('');
    setNewAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="border-b border-[#16161a] pb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-[#888892]">
          RECURSOS Y CONTROL FINANCIERO
        </span>
        <h2 className="font-sans font-light text-white text-3xl tracking-tight mt-1">
          Mis Gastos y <span className="font-medium">Finanzas</span>
        </h2>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total card */}
        <div className="bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#ef4444] block">EGRESOS REGISTRADOS TOTALES</span>
            <span className="font-sans font-bold text-3xl text-white mt-1.5 block">${totalExpense.toLocaleString()} USD</span>
            <span className="font-mono text-[9px] text-[#555562] mt-1 block">CONVERSIÓN DE DIVISA DÓLAR</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500">
            <TrendingDown size={22} />
          </div>
        </div>

        {/* Category breakdown stats list */}
        <div className="bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6 md:col-span-2 flex flex-col justify-between">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] pb-2 mb-2 border-b border-[#111] block">
            DESGLOSE MATEMÁTICO POR CATEGORÍA
          </span>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map(cat => {
              const occurrences = expenses.filter(e => e.category === cat);
              const amountCat = occurrences.reduce((sum, e) => sum + e.amount, 0);
              return (
                <div key={cat} className="bg-[#121217]/50 border border-[#1c1c28] rounded-xl p-2.5 text-center">
                  <span className="font-mono text-[8px] text-gray-500 block truncate uppercase">{cat}</span>
                  <span className="font-sans font-semibold text-xs text-white block mt-1">${amountCat}</span>
                  <span className="font-mono text-[8px] text-[#444455] block mt-0.5">{occurrences.length} refs</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Expense form (4 cols) */}
        <div className="lg:col-span-4 bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6 space-y-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#888892] flex items-center gap-1.5">
            <Plus size={12} className="text-[#00f2ff]" /> Registrar Egreso
          </span>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase">Descripción o adquisición</label>
              <input
                type="text"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Ej. Suscripción Claude Pro..."
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] text-gray-400 uppercase">Monto ($USD)</label>
                <input
                  type="number"
                  step="any"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  placeholder="Ej. 20"
                  className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-all font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] text-gray-400 uppercase">Fecha</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-2.5 py-3 text-xs text-white focus:outline-none focus:border-gray-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-gray-400 uppercase">Categoría de Egreso</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full bg-[#111116] border border-[#23232c] rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-gray-500 transition-all font-mono"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-black transition-all shadow-lg cursor-pointer"
              style={{ backgroundColor: colorTema }}
            >
              Registrar Coste
            </button>
          </form>
        </div>

        {/* Expense logs list (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#888892] px-1 block mb-1">
            Histórico de Transacciones ({expenses.length})
          </span>

          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {expenses.map(exp => (
                <motion.div
                  key={exp.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#0a0a0f] border border-[#161622] rounded-xl p-4 hover:border-gray-700 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                    <div className="w-9 h-9 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                      -${exp.amount}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-sans font-medium text-white text-sm truncate">
                        {exp.description}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 font-mono text-[10px] text-gray-500">
                        <span className="uppercase text-gray-400">
                          📁 {exp.category}
                        </span>
                        <span>•</span>
                        <span>📅 {exp.date}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="text-gray-600 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/5 transition cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {expenses.length === 0 && (
              <div className="text-center py-16 bg-[#08080b]/60 rounded-2xl border border-dashed border-[#1a1a26]">
                <DollarSign className="mx-auto text-gray-600 mb-3" size={32} />
                <p className="font-sans font-light text-sm text-gray-500 italic">
                  No hay transacciones registradas.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
