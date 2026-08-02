'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Calendar } from 'lucide-react';

interface NewSessionModalProps {
  onClose: () => void;
  onCreate: (name: string, date: string) => void;
}

export function NewSessionModal({ onClose, onCreate }: NewSessionModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e?.preventDefault();
    if (!name?.trim()) return;
    const dateStr = date || new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    onCreate(name?.trim(), dateStr);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e: React.MouseEvent) => e?.stopPropagation()}
        className="bg-[var(--quiz-card)] border border-[hsl(var(--border))] rounded-xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-xl text-white">Nova Sessão</h3>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-[hsl(var(--muted-foreground))] mb-1 block">Nome da Sessão</label>
            <input
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e?.target?.value ?? '')}
              placeholder="Ex: Culto de Domingo"
              className="w-full bg-[var(--quiz-dark)] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-white placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[var(--quiz-gold)] transition"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm text-[hsl(var(--muted-foreground))] mb-1 block flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Data (opcional)
            </label>
            <input
              type="text"
              value={date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e?.target?.value ?? '')}
              placeholder="Ex: 03/08/2026"
              className="w-full bg-[var(--quiz-dark)] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-white placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[var(--quiz-gold)] transition"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] text-white hover:bg-[hsl(var(--secondary))]/80 transition text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name?.trim()}
              className="flex items-center gap-2 bg-[var(--quiz-gold)] text-[var(--quiz-dark)] font-bold px-5 py-2 rounded-lg hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Plus className="w-4 h-4" />
              Criar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
