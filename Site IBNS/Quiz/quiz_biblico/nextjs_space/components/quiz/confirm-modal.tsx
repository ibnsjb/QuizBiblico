'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'warning' | 'danger';
}

export function ConfirmModal({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onCancel, variant = 'warning' }: ConfirmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e: React.MouseEvent) => e?.stopPropagation()}
        className="bg-[var(--quiz-card)] border border-[hsl(var(--border))] rounded-xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-[var(--quiz-red)]/20' : 'bg-[var(--quiz-gold)]/20'}`}>
              <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-[var(--quiz-red)]' : 'text-[var(--quiz-gold)]'}`} />
            </div>
            <h3 className="font-display font-bold text-lg text-white">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-[hsl(var(--muted-foreground))] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] text-white hover:bg-[hsl(var(--secondary))]/80 transition-colors text-sm font-medium"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 ${
              variant === 'danger'
                ? 'bg-[var(--quiz-red)] text-white hover:bg-red-700'
                : 'bg-[var(--quiz-gold)] text-[var(--quiz-dark)] hover:bg-yellow-400'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
