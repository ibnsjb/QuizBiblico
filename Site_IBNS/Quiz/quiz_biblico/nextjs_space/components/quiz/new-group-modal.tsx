'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface NewGroupModalProps {
  onClose: () => void;
  onCreate: (name: string, continueCreating: boolean) => void | Promise<void>;
}

export function NewGroupModal({ onClose, onCreate }: NewGroupModalProps) {
  const [name, setName] = useState('');
  const handleCreate = async (continueCreating: boolean) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    await onCreate(trimmedName, continueCreating);
    if (continueCreating) setName('');
  };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void handleCreate(false);
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(event: React.MouseEvent) => event.stopPropagation()} className="bg-[var(--quiz-card)] border border-[hsl(var(--border))] rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-xl text-white">Novo grupo</h3>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-white p-1" title="Fechar"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="text-sm text-[hsl(var(--muted-foreground))] block">Nome do grupo
            <input type="text" value={name} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)} placeholder="Ex: Grupo Esperança" autoFocus className="mt-1 w-full bg-[var(--quiz-dark)] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-white placeholder-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[var(--quiz-gold)]" />
          </label>
          <div className="flex flex-wrap gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] text-white hover:bg-[hsl(var(--secondary))]/80 transition text-sm">Cancelar</button>
            <button type="button" onClick={() => void handleCreate(true)} disabled={!name.trim()} className="flex items-center gap-2 bg-[var(--quiz-green)] text-white font-bold px-5 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50 text-sm"><Plus className="w-4 h-4" />Criar +1</button>
            <button type="submit" disabled={!name.trim()} className="flex items-center gap-2 bg-[var(--quiz-gold)] text-[var(--quiz-dark)] font-bold px-5 py-2 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 text-sm"><Plus className="w-4 h-4" />Criar e finalizar</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
