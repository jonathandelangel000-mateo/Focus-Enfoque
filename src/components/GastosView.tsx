import { useState, FormEvent } from 'react';
import { Expense } from '../types';
import { DollarSign, Plus, Trash2, CalendarDays, BarChart4, TrendingDown, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GastosViewProps {
  expenses: Expense[];
  setExpenses: (expenses: Expense[] | ((prev: Expense[]) => Expense[])) => void;
  colorTema: string;
  addNotification?: (title: string, body: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const currencies: Currency[] = [
  { code: 'MXN', symbol: '$', name: 'Pesos Mexicanos (MXN)' },
  { code: 'USD', symbol: '$', name: 'Dólares (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euros (EUR)' },
  { code: 'GBP', symbol: '£', name: 'Libras Esterlinas (GBP)' }
];

export default function GastosView({ expenses, setExpenses, colorTema, addNotification }: GastosViewProps) {
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Productividad');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  // Currency Selection state with localStorage persistence and MXN as default
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency_setting');
    if (saved) {
      const found = currencies.find(c => c.code === saved);
      if (found) return found;
    }
    return currencies[0]; // MXN por defecto
  });

  const categories = ['Productividad', 'Alimentación', 'Servicios', 'Educación', 'Estilo de Vida', 'Otros'];

  const handleCurrencyChange = (code: string) => {
    const curr = currencies.find(c => c.code === code);
    if (curr) {
      setSelectedCurrency(curr);
      localStorage.setItem('currency_setting', code);
      if (addNotification) {
        addNotification(
          'Divisa Actualizada 🌐', 
          `Ahora el panel está configurado en ${curr.name}`, 
          'info'
        );
      }
    }
  };

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
    if (addNotification) {
      addNotification(
        'Gasto Registrado 💸', 
        `Egreso de ${selectedCurrency.symbol}${newExp.amount.toLocaleString()} ${selectedCurrency.code} en "${newExp.description}"`, 
        'warning'
      );
    }
    setNewDesc('');
    setNewAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    const expense = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    if (expense && addNotification) {
      addNotification(
        'Gasto Eliminado 🗑️', 
        `Se retiró el egreso de ${selectedCurrency.symbol}${expense.amount.toLocaleString()} ${selectedCurrency.code} por "${expense.description}"`, 
        'info'
      );
    }
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="border-b border-[#16161a] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#888892]">
            RECURSOS Y CONTROL FINANCIERO
          </span>
          <h2 className="font-sans font-light text-white text-3xl tracking-tight mt-1">
            Mis Gastos y <span className="font-medium">Finanzas</span>
          </h2>
        </div>

        {/* Currency Selector (Punto 3 extra) */}
        <div className="bg-[#0a0a0f] border border-[#1c1c28] p-1.5 rounded-xl flex items-center gap-1 self-start sm:self-center">
          <div className="text-[#888892] px-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider shrink-0">
            <Globe size={11} className="animate-pulse" style={{ color: colorTema }} /> Divisa
          </div>
          <div className="flex items-center gap-1">
            {currencies.map(curr => (
              <button
                key={curr.code}
                type="button"
                onClick={() => handleCurrencyChange(curr.code)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                  selectedCurrency.code === curr.code
                    ? 'text-black bg-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                style={selectedCurrency.code === curr.code ? { backgroundColor: colorTema, color: '#000' } : undefined}
                title={curr.name}
              >
                {curr.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total card */}
        <div className="bg-[#0a0a0f] border border-[#16161c] rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#ef4444] block">EGRESOS REGISTRADOS TOTALES</span>
            <span className="font-sans font-bold text-3xl text-white mt-1.5 block">
              {selectedCurrency.symbol}{totalExpense.toLocaleString()} <span className="text-xs font-normal text-gray-500">{selectedCurrency.code}</span>
            </span>
            <span className="font-mono text-[9px] text-[#555562] mt-1 block">TIPO DE CAMBIO ESTABLECIDO EN EL AJUSTE</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {categories.map(cat => {
              const occurrences = expenses.filter(e => e.category === cat);
              const amountCat = occurrences.reduce((sum, e) => sum + e.amount, 0);
              return (
                <div key={cat} className="bg-[#121217]/50 border border-[#1c1c28] rounded-xl p-2.5 text-center">
                  <span className="font-mono text-[8px] text-gray-500 block truncate uppercase">{cat}</span>
                  <span className="font-sans font-semibold text-xs text-white block mt-1">
                    {selectedCurrency.symbol}{amountCat.toLocaleString()}
                  </span>
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
                <label className="font-mono text-[10px] text-gray-400 uppercase">
                  Monto ({selectedCurrency.symbol}{selectedCurrency.code})
                </label>
                <input
                  type="number"
                  step="any"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  placeholder="Ej. 399"
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
                    <div className="px-2.5 h-9 min-w-[70px] rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-400 shrink-0 font-mono text-xs font-bold gap-0.5">
                      -{selectedCurrency.symbol}{exp.amount.toLocaleString()}
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
                        <span>•</span>
                        <span className="text-[#888892]">{selectedCurrency.code}</span>
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
