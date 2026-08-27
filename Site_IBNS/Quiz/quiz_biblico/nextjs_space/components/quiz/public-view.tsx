'use client';

import { useEffect, useRef, useState } from 'react';
import { SessionData, GroupData, HELP_LABELS } from '@/types/quiz';
import { rankGroups } from '@/lib/ranking';
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
  const currentGroupRef = useRef<HTMLDivElement | null>(null);
  const [now, setNow] = useState(Date.now());
  const publicTheme = session?.config?.publicTheme ?? 'ocean';
  const themeClasses = {
    ocean: 'bg-[#062b3a] text-cyan-50 border-cyan-400/40',
    forest: 'bg-[#102d25] text-emerald-50 border-emerald-400/40',
    sunrise: 'bg-[#3b1f2b] text-rose-50 border-orange-300/40',
  }[publicTheme];

  useEffect(() => {
    const hasActiveTimer = Object.values(groups).some((group) => (group.bibleConsultExpiresAt ?? 0) > Date.now());
    if (!hasActiveTimer) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [groups]);

  const getRoundPoints = (round: number) => (session?.config?.scoringRanges ?? []).find((range) => round >= range.startRound && round <= range.endRound)?.points ?? session?.config?.defaultPoints ?? 10;

  useEffect(() => {
    if (!currentGroupId || allAnswered || isFinished) return;
    const timeout = window.setTimeout(() => currentGroupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    return () => window.clearTimeout(timeout);
  }, [currentGroupId, currentRound, allAnswered, isFinished]);

  return (
    <div className={`min-h-screen rounded-2xl border p-3 sm:p-6 ${themeClasses}`}>
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

      <Podium groups={groups} tiebreakerWinner={tiebreaker?.winner} tiebreaker={tiebreaker} />

      {isFinished && <FinalScoreboard groups={groups} tiebreaker={tiebreaker} />}

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

      {Object.entries(groups).map(([groupId, group]) => {
        const seconds = Math.max(0, Math.ceil(((group.bibleConsultExpiresAt ?? 0) - now) / 1000));
        if (!group.bibleConsultExpiresAt) return null;
        return (
          <div key={groupId} className={`mb-4 rounded-xl border-2 p-4 text-center ${seconds > 0 ? 'border-cyan-300 bg-cyan-950/70 text-cyan-100' : 'border-red-400 bg-red-950/70 text-red-100'}`}>
            <p className="text-xs font-bold uppercase tracking-widest">Consulta à Bíblia: {group.name}</p>
            <p className="mt-1 font-mono text-4xl font-bold sm:text-5xl">{seconds > 0 ? `${seconds}s` : 'TEMPO ESGOTADO'}</p>
          </div>
        );
      })}

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
              ref={isCurrent ? currentGroupRef : undefined}
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
                    const roundHelps = (group?.helpsUsed ?? []).filter((help) => help.round === round);
                    const doubled = roundHelps.some((help) => help.type === 'doubleScore');

                    return (
                      <div key={round} className="flex flex-wrap items-center gap-2 border-b border-white/10 py-2">
                        <span className="text-xs font-mono font-bold w-20">Rodada {round}</span>
                        <span className="text-[10px] opacity-70">vale {getRoundPoints(round)} pts</span>
                        <div className="flex-1" />
                        {answered ? (
                          <>
                            <span className={`font-mono text-sm font-bold ${
                              (score ?? 0) > 0 ? 'text-emerald-300' : 'text-rose-300'
                            }`}>{(score ?? 0) > 0 ? `+${score}` : '0'}</span>
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${
                              (score ?? 0) > 0 ? 'bg-[var(--quiz-green)]' : 'bg-[var(--quiz-red)]'
                            }`}>
                              {(score ?? 0) > 0 ? <Check className="w-3.5 h-3.5 text-white" /> : <X className="w-3.5 h-3.5 text-white" />}
                            </div>
                            {roundHelps.length > 0 && <div className="basis-full pl-20 text-[10px] font-bold text-orange-200">Ajudas: {roundHelps.map((help) => HELP_LABELS[help.type] ?? help.type).join(', ')}{doubled ? ' | Pontuação dobrada' : ''}</div>}
                          </>
                        ) : (
                          <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
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

function FinalScoreboard({ groups, tiebreaker }: { groups: Record<string, GroupData>; tiebreaker?: SessionData['tiebreaker'] }) {
  const sortedGroups = rankGroups(groups, tiebreaker);
  const positions: number[] = [];
  sortedGroups.forEach((item, index) => {
    positions[index] = index === 0 || item.group.total !== sortedGroups[index - 1]?.group.total || item.tiebreakerWins !== sortedGroups[index - 1]?.tiebreakerWins
      ? index + 1
      : positions[index - 1];
  });
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-2xl border-2 border-[var(--quiz-gold)] bg-[var(--quiz-dark)]/80 p-5 sm:p-8 gold-glow">
      <div className="text-center mb-6"><Trophy className="w-12 h-12 text-[var(--quiz-gold)] mx-auto mb-2" /><h3 className="font-display text-3xl sm:text-5xl font-bold text-[var(--quiz-gold)]">Placar Geral</h3><p className="text-[hsl(var(--muted-foreground))] mt-2">Resultado final da sessão</p></div>
      <div className="space-y-3 max-w-3xl mx-auto">
        {sortedGroups.map(({ id, group, tiebreakerWins }, index) => <div key={id} className={`flex items-center gap-3 sm:gap-5 rounded-xl border p-4 sm:p-5 ${positions[index] === 1 ? 'border-[var(--quiz-gold)] bg-[var(--quiz-gold)]/15' : 'border-[hsl(var(--border))] bg-[var(--quiz-card)]'}`}><span className="w-10 text-center font-display text-2xl sm:text-3xl font-bold text-[var(--quiz-gold)]">{positions[index]}º</span><span className="flex-1 min-w-0 text-lg sm:text-2xl font-bold text-white truncate">{group.name}</span><span className="font-mono text-2xl sm:text-4xl font-bold text-[var(--quiz-gold)]">{group.total ?? 0}<small className="ml-1 text-xs sm:text-sm font-normal">pts</small>{tiebreakerWins > 0 && <small className="ml-2 text-sm font-normal">({tiebreakerWins})</small>}</span></div>)}
      </div>
    </motion.section>
  );
}
