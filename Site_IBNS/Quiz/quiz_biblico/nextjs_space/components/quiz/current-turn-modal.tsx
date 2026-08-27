'use client';

import { motion } from 'framer-motion';
import { Check, Clock3, HelpCircle, X } from 'lucide-react';
import { GroupData, HELP_LABELS, HelpUsage, SessionConfig } from '@/types/quiz';

interface CurrentTurnModalProps {
  group: GroupData;
  groupId: string;
  round: number;
  points: number;
  config?: SessionConfig;
  bibleTimer: number;
  bibleTimerGroupId: string | null;
  onAnswer: (groupId: string, round: number, correct: boolean) => void;
  onUseHelp: (groupId: string, helpType: string) => void;
  onUndoHelp: (groupId: string, helpType: string) => void;
  onClose: () => void;
}

export function CurrentTurnModal({
  group,
  groupId,
  round,
  points,
  config,
  bibleTimer,
  bibleTimerGroupId,
  onAnswer,
  onUseHelp,
  onUndoHelp,
  onClose,
}: CurrentTurnModalProps) {
  const helpsUsed = group.helpsUsed ?? [];
  const isBibleTimerActive = bibleTimerGroupId === groupId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Vez de ${group.name}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 18 }}
        className="w-full max-w-4xl max-h-[calc(100vh-24px)] overflow-hidden rounded-2xl border-2 border-[var(--quiz-gold)] bg-[var(--quiz-card)] p-3 shadow-2xl sm:max-h-[calc(100vh-48px)] sm:p-7 gold-glow"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border))] pb-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--quiz-gold)]">Vez do grupo</p>
            <h2 className="mt-1 truncate font-display text-2xl font-bold text-white sm:text-5xl">{group.name}</h2>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-white/10 hover:text-white" title="Ver placar geral">
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 sm:gap-4 sm:py-5">
          <div className="col-span-2 rounded-xl bg-[var(--quiz-dark)] p-3 text-center sm:p-4">
            <p className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Rodada atual</p>
            <p className="mt-1 font-display text-2xl font-bold text-white sm:text-5xl">Rodada {round}</p>
            <p className="mt-1 text-sm font-bold text-[var(--quiz-gold)] sm:text-lg">Valendo {points} pontos</p>
          </div>
          <div className="rounded-xl border border-[var(--quiz-gold)]/50 bg-[var(--quiz-gold)]/10 p-4 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Pontuação atual</p>
            <p className="mt-1 font-mono text-3xl font-bold text-[var(--quiz-gold)] sm:text-5xl">{group.total ?? 0}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">pontos</p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[var(--quiz-dark)]/60 p-3 sm:p-4">
            <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] sm:mb-3 sm:text-sm">Resultado</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onAnswer(groupId, round, true)} className="flex min-h-14 items-center justify-center gap-1 rounded-xl bg-[var(--quiz-green)] px-2 text-base font-bold text-white transition hover:bg-green-600 active:scale-95 sm:min-h-24 sm:gap-2 sm:text-xl">
                <Check className="h-6 w-6 sm:h-7 sm:w-7" /> Acerto
              </button>
              <button onClick={() => onAnswer(groupId, round, false)} className="flex min-h-14 items-center justify-center gap-1 rounded-xl bg-[var(--quiz-red)] px-2 text-base font-bold text-white transition hover:bg-red-700 active:scale-95 sm:min-h-24 sm:gap-2 sm:text-xl">
                <X className="h-6 w-6 sm:h-7 sm:w-7" /> Erro
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[var(--quiz-dark)]/60 p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] sm:text-sm">Ajudas</p>
              <span className="text-xs font-bold text-[var(--quiz-gold)]">Restam {group.helpsRemaining ?? 0}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {Object.entries(config?.helpsEnabled ?? {}).map(([key, enabled]) => {
                if (!enabled) return null;
                const isUsed = helpsUsed.some((help: HelpUsage) => help.type === key);
                const canUse = (group.helpsRemaining ?? 0) > 0 && !isUsed;
                const canUndo = key === 'doubleScore' ? isUsed && group.doubleActive === true : isUsed;
                return (
                  <button
                    key={key}
                    disabled={!canUse && !canUndo}
                    onClick={() => canUndo ? onUndoHelp(groupId, key) : onUseHelp(groupId, key)}
                    className={`flex min-h-10 items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-bold transition sm:min-h-12 sm:gap-2 sm:px-2 sm:text-sm ${
                      canUndo ? 'bg-[var(--quiz-orange)]/30 text-[var(--quiz-orange)] hover:bg-[var(--quiz-orange)]/50' :
                      canUse ? 'bg-[var(--quiz-green)] text-white hover:bg-green-600' :
                      'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                    }`}
                  >
                    <HelpCircle className="h-4 w-4" />
                    {HELP_LABELS[key] ?? key}
                    {isUsed && <span>✓</span>}
                  </button>
                );
              })}
            </div>
            {isBibleTimerActive && (
              <div className={`mt-3 flex items-center justify-center gap-2 rounded-lg p-2 font-mono text-xl font-bold ${bibleTimer > 0 ? 'bg-[var(--quiz-gold)]/15 text-[var(--quiz-gold)]' : 'bg-[var(--quiz-red)]/20 text-[var(--quiz-red)]'}`}>
                <Clock3 className="h-4 w-4" /> Bíblia: {bibleTimer}s
              </div>
            )}
          </div>
        </div>

        <button onClick={onClose} className="mt-3 w-full rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-sm font-bold text-[hsl(var(--muted-foreground))] transition hover:bg-white/10 hover:text-white sm:mt-5 sm:py-3">
          Visão geral
        </button>
      </motion.div>
    </motion.div>
  );
}
