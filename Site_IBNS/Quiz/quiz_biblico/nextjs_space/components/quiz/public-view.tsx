'use client';

import { SessionData, GroupData } from '@/types/quiz';
import { Podium } from './podium';
import { motion } from 'framer-motion';
import { Check, X, Trophy, Swords } from 'lucide-react';

interface PublicViewProps {
  session: SessionData;
}

export function PublicView({ session }: PublicViewProps) {
  const groups = session?.groups ?? {};
  const groupOrder = session?.groupOrder ?? Object.keys(groups);
  const currentRound = session?.currentRound ?? 1;
  const currentGroupIndex = session?.currentGroupIndex ?? 0;
  const totalRounds = session?.totalRounds ?? 8;
  const isFinished = session?.status === 'finished';
  const tiebreaker = session?.tiebreaker;

  const currentGroupId = groupOrder?.[currentGroupIndex] ?? '';
  const allAnswered = currentGroupIndex >= (groupOrder?.length ?? 0);

  return (
    <div>
      {/* Session name */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
          {session?.name ?? 'Sessão'}
        </h2>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
          {session?.date ?? ''}
          {isFinished && <span className="ml-2 text-[hsl(var(--muted-foreground))]">— Encerrada</span>}
        </p>
      </motion.div>

      <Podium groups={groups} />

      {/* Winner announcement */}
      {tiebreaker?.winner && tiebreaker?.winner !== 'tie' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--quiz-gold)]/20 border border-[var(--quiz-gold)] rounded-xl p-6 text-center mb-6 gold-glow"
        >
          <Trophy className="w-12 h-12 text-[var(--quiz-gold)] mx-auto mb-2" />
          <p className="text-[var(--quiz-gold)] font-display font-bold text-2xl">
            {groups?.[tiebreaker.winner]?.name ?? 'Vencedor'} venceu!
          </p>
        </motion.div>
      )}

      {/* Tiebreaker indicator */}
      {tiebreaker?.active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[var(--quiz-orange)]/20 border border-[var(--quiz-orange)]/50 rounded-xl p-4 text-center mb-6"
        >
          <Swords className="w-6 h-6 text-[var(--quiz-orange)] mx-auto mb-1" />
          <p className="text-[var(--quiz-orange)] font-bold">DESEMPATE EM ANDAMENTO</p>
        </motion.div>
      )}

      {/* Round indicator */}
      {!isFinished && (
        <div className="text-center mb-4">
          <span className="text-[hsl(var(--muted-foreground))] text-sm">
            Rodada <span className="text-white font-bold">{Math.min(currentRound, totalRounds)}</span>/{totalRounds}
            {currentGroupId && !allAnswered && (
              <> — Vez de <span className="text-[var(--quiz-gold)] font-bold">{groups?.[currentGroupId]?.name ?? ''}</span></>
            )}
          </span>
        </div>
      )}

      {/* Group cards - read only */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groupOrder?.map((gid: string, index: number) => {
          const group = groups?.[gid];
          if (!group) return null;
          const isCurrent = gid === currentGroupId && !allAnswered && !isFinished;

          return (
            <motion.div
              key={gid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-[var(--quiz-card)] border rounded-xl overflow-hidden ${
                isCurrent ? 'border-[var(--quiz-gold)] animate-pulse-gold' : 'border-[hsl(var(--border))]'
              }`}
            >
              <div className={`p-3 ${
                isCurrent ? 'bg-[var(--quiz-blue)]' : 'bg-[var(--quiz-dark)]/50'
              }`}>
                <p className="text-white font-bold truncate">{group?.name ?? '---'}</p>
              </div>

              <div className="px-3 pb-3 pt-2">
                <div className="space-y-1">
                  {Array.from({ length: totalRounds }, (_, i: number) => i + 1)?.map((round: number) => {
                    const score = group?.scores?.[`round${round}`];
                    const answered = score !== undefined && score !== null;

                    return (
                      <div key={round} className="flex items-center gap-2 py-1">
                        <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono w-7">R{round}</span>
                        <div className="flex-1" />
                        {answered ? (
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${
                            (score ?? 0) > 0 ? 'bg-[var(--quiz-green)]' : 'bg-[var(--quiz-red)]'
                          }`}>
                            {(score ?? 0) > 0 ? <Check className="w-3.5 h-3.5 text-white" /> : <X className="w-3.5 h-3.5 text-white" />}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded bg-[hsl(var(--muted))] flex items-center justify-center">
                            <span className="text-[hsl(var(--muted-foreground))] text-xs">•</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 bg-[var(--quiz-gold)]/20 rounded-lg py-2 text-center">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">TOTAL: </span>
                  <span className="text-[var(--quiz-gold)] font-bold font-mono text-2xl">{group?.total ?? 0}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
