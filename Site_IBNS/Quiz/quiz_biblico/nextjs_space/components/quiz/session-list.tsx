'use client';

import { SessionData, ViewMode } from '@/types/quiz';
import { motion } from 'framer-motion';
import { Users, Calendar, Trash2, ChevronRight, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ConfirmModal } from './confirm-modal';
import { AnimatePresence } from 'framer-motion';

interface SessionListProps {
  sessions: Record<string, SessionData>;
  mode: ViewMode;
  onDelete: (id: string) => void;
}

export function SessionList({ sessions, mode, onDelete }: SessionListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const entries = Object.entries(sessions ?? {}).sort(
    (a: [string, SessionData], b: [string, SessionData]) => (b[1]?.createdAt ?? 0) - (a[1]?.createdAt ?? 0)
  );

  if (entries?.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Trophy className="w-16 h-16 text-[var(--quiz-gold)]/30 mx-auto mb-4" />
        <p className="text-[hsl(var(--muted-foreground))] text-lg">Nenhuma sessão ativa</p>
        {mode === 'apresentador' && (
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">Crie uma nova sessão para começar!</p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {entries?.map(([id, session]: [string, SessionData], index: number) => {
        const groupCount = Object.keys(session?.groups ?? {})?.length ?? 0;
        const isActive = session?.status === 'active';

        return (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/sessao/${id}`}>
              <div className={`bg-[var(--quiz-card)] hover:bg-[var(--quiz-card-hover)] border border-[hsl(var(--border))] rounded-xl p-5 transition-all cursor-pointer group ${
                isActive ? 'border-l-4 border-l-[var(--quiz-green)]' : 'border-l-4 border-l-[hsl(var(--muted-foreground))]/30 opacity-70'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-[var(--quiz-gold)] transition-colors">
                        {session?.name ?? 'Sem nome'}
                      </h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[var(--quiz-green)]/20 text-[var(--quiz-green)]'
                          : 'bg-[hsl(var(--muted))]/50 text-[hsl(var(--muted-foreground))]'
                      }`}>
                        {isActive ? 'Ativa' : 'Encerrada'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {session?.date ?? ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {groupCount} grupo{groupCount !== 1 ? 's' : ''}
                      </span>
                      <span>Rodada {session?.currentRound ?? 1}/{session?.totalRounds ?? 8}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {mode === 'apresentador' && (
                      <button
                        onClick={(e: React.MouseEvent) => { e?.preventDefault(); e?.stopPropagation(); setDeleteId(id); }}
                        className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[var(--quiz-red)] transition-colors rounded-lg hover:bg-[var(--quiz-red)]/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-[hsl(var(--muted-foreground))] group-hover:text-[var(--quiz-gold)] transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {deleteId && (
          <ConfirmModal
            title="Excluir Sessão"
            message="Tem certeza que deseja excluir esta sessão? Todos os dados serão perdidos."
            confirmLabel="Excluir"
            variant="danger"
            onConfirm={() => { onDelete(deleteId); setDeleteId(null); }}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
