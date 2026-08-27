'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { SessionData, GroupData, HELP_LABELS, HelpUsage } from '@/types/quiz';
import { Podium } from './podium';
import {
  addGroup, removeGroup, updateGroupName, markAnswer, advanceRound, startQuiz,
  useHelp, undoHelp, undoLastAnswer, shuffleGroups, finishSession, clearSession,
  startTiebreaker, tiebreakerAnswer, endTiebreaker
} from '@/lib/firebase-operations';
import { ConfirmModal } from './confirm-modal';
import { ShuffleAnimation } from './shuffle-animation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Check, X, Shuffle, UserPlus, RotateCcw, Flag,
  HelpCircle, BookOpen, Users as UsersIcon, Zap, ChevronRight,
  Award, Swords, Dice6, Undo2
} from 'lucide-react';
import { NewGroupModal } from './new-group-modal';
import { CurrentTurnModal } from './current-turn-modal';

interface PresenterViewProps {
  session: SessionData;
  sessionId: string;
  play: (sound: 'correct' | 'wrong' | 'shuffle' | 'help' | 'double' | 'winner' | 'tiebreaker') => void;
}

export function PresenterView({ session, sessionId, play }: PresenterViewProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [showShuffle, setShowShuffle] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<string[] | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [bibleTimer, setBibleTimer] = useState(0);
  const [bibleTimerGroupId, setBibleTimerGroupId] = useState<string | null>(null);
  const [showTurnModal, setShowTurnModal] = useState(true);
  const currentGroupRef = useRef<HTMLDivElement | null>(null);

  const groups = session?.groups ?? {};
  const groupOrder = session?.groupOrder ?? Object.keys(groups);
  const currentRound = session?.currentRound ?? 1;
  const currentGroupIndex = session?.currentGroupIndex ?? 0;
  const totalRounds = session?.totalRounds ?? 8;
  const config = session?.config;
  const tiebreaker = session?.tiebreaker;
  const isFinished = session?.status === 'finished';
  const quizStarted = session?.quizStarted === true;

  const currentGroupId = groupOrder?.[currentGroupIndex] ?? '';
  const allAnswered = currentGroupIndex >= (groupOrder?.length ?? 0);
  const allRoundsDone = currentRound >= totalRounds && allAnswered;
  const currentPoints = (config?.scoringRanges ?? []).find((range) => currentRound >= range.startRound && currentRound <= range.endRound)?.points ?? config?.defaultPoints ?? 10;

  useEffect(() => {
    if (!currentGroupId || allAnswered || isFinished) return;
    const timeout = window.setTimeout(() => currentGroupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    return () => window.clearTimeout(timeout);
  }, [currentGroupId, currentRound, allAnswered, isFinished]);

  useEffect(() => {
    if (quizStarted && currentGroupId && !allAnswered && !isFinished && !tiebreaker?.active) {
      setShowTurnModal(true);
    }
  }, [quizStarted, currentGroupId, currentRound, allAnswered, isFinished, tiebreaker?.active]);

  useEffect(() => {
    if (bibleTimer <= 0) return;
    const interval = window.setInterval(() => setBibleTimer((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [bibleTimer]);

  // Detect ties
  const tiedGroups = useMemo(() => {
    if (!allRoundsDone) return [];
    const sorted = Object.entries(groups)
      .map(([id, g]: [string, GroupData]) => ({ id, total: g?.total ?? 0 }))
      .sort((a: any, b: any) => b.total - a.total);
    if (sorted?.length < 2) return [];
    const topScore = sorted[0]?.total ?? 0;
    const tied = sorted?.filter((g: any) => g?.total === topScore);
    return (tied?.length ?? 0) > 1 ? tied?.map((g: any) => g?.id) : [];
  }, [allRoundsDone, groups]);

  const handleAddGroup = async () => {
    if (!newGroupName?.trim()) return;
    await addGroup(sessionId, newGroupName?.trim());
    setNewGroupName('');
  };

  const handleCreateGroup = async (name: string, continueCreating: boolean) => {
    await addGroup(sessionId, name);
    if (!continueCreating) setShowNewGroup(false);
  };

  const handleStartQuiz = async () => {
    await startQuiz(sessionId);
    setShowShuffle(false);
    setShowTurnModal(true);
  };

  const handleShuffle = async () => {
    play('shuffle');
    setShowShuffle(true);
    const ids = await shuffleGroups(sessionId);
    setShuffleOrder(ids ?? null);
    setTimeout(() => {
      setShowShuffle(false);
      setShuffleOrder(null);
    }, 2000);
  };

  const handleMark = async (groupId: string, round: number, correct: boolean) => {
    play(correct ? 'correct' : 'wrong');
    await markAnswer(sessionId, groupId, round, correct);
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    await advanceRound(sessionId);
  };

  const handleUseHelp = async (groupId: string, helpType: string) => {
    if (helpType === 'doubleScore') {
      play('double');
    } else {
      play('help');
    }

    let extra: Record<string, any> = {};
    if (helpType === 'eliminateAnswer') {
      const letters = ['A', 'B', 'C', 'D'];
      const eliminated = letters[Math.floor(Math.random() * letters?.length)] ?? 'A';
      extra = { eliminated };
    }

    await useHelp(sessionId, groupId, helpType, currentRound, extra);
    if (helpType === 'bibleConsult') {
      setBibleTimer(config?.bibleConsultSeconds ?? 30);
      setBibleTimerGroupId(groupId);
    }
  };

  const handleUndoHelp = async (groupId: string, helpType: string) => {
    play('help');
    await undoHelp(sessionId, groupId, helpType);
  };

  const handleUndoLastAnswer = async () => {
    play('help');
    await undoLastAnswer(sessionId);
  };

  const handleStartTiebreaker = async () => {
    play('tiebreaker');
    await startTiebreaker(sessionId, tiedGroups);
  };

  const handleEndTie = async () => {
    await endTiebreaker(sessionId, 'tie');
    await finishSession(sessionId);
  };

  const handleRandomWinner = async () => {
    play('winner');
    const winner = tiedGroups[Math.floor(Math.random() * tiedGroups?.length)] ?? tiedGroups[0];
    await endTiebreaker(sessionId, winner ?? '');
    await finishSession(sessionId);
  };

  const handleSaveGroupName = async (groupId: string) => {
    if (editName?.trim()) {
      await updateGroupName(sessionId, groupId, editName?.trim());
    }
    setEditingGroup(null);
  };

  return (
    <div>
      <Podium groups={groups} tiebreakerWinner={tiebreaker?.winner} />

      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setShowTurnModal(true)}
          disabled={!currentGroupId || allAnswered || isFinished || Boolean(tiebreaker?.active)}
          className="rounded-lg border border-[var(--quiz-gold)] px-4 py-2 text-sm font-bold text-[var(--quiz-gold)] transition hover:bg-[var(--quiz-gold)]/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Abrir grupo da vez
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
                {!quizStarted && !isFinished && Object.keys(groups).length > 0 && (
                  <button
                    onClick={handleStartQuiz}
                    className="flex items-center gap-2 bg-[var(--quiz-gold)] text-[var(--quiz-dark)] font-bold px-5 py-3 rounded-lg hover:bg-yellow-400 transition-all text-sm"
                  >
                    <ChevronRight className="w-4 h-4" /> INICIAR QUIZ
                  </button>
                )}
        <button
          onClick={() => {
            setShowNewGroup(true);
          }}
          className="flex items-center gap-2 bg-[var(--quiz-green)] text-white font-bold px-4 py-2.5 rounded-lg hover:bg-green-600 transition-all text-sm"
        >
          <Plus className="w-4 h-4" /> NOVO GRUPO
        </button>
        <button
          onClick={handleShuffle}
          disabled={(Object.keys(groups)?.length ?? 0) < 2}
          className="flex items-center gap-2 bg-[var(--quiz-purple)] text-white font-bold px-4 py-2.5 rounded-lg hover:bg-purple-600 transition-all text-sm disabled:opacity-40"
        >
          <Shuffle className="w-4 h-4" /> SORTEAR
        </button>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-2 bg-[var(--quiz-red)] text-white font-bold px-4 py-2.5 rounded-lg hover:bg-red-700 transition-all text-sm"
        >
          <Trash2 className="w-4 h-4" /> LIMPAR
        </button>
        {!isFinished && !tiebreaker?.active && !(currentRound === 1 && currentGroupIndex === 0) && (
          <button
            onClick={handleUndoLastAnswer}
            title="Reverter a última resposta marcada"
            className="flex items-center gap-2 bg-[var(--quiz-blue)] text-white font-bold px-4 py-2.5 rounded-lg hover:opacity-90 transition-all text-sm"
          >
            <Undo2 className="w-4 h-4" /> REVERTER ÚLTIMO
          </button>
        )}
        {!isFinished && allRoundsDone && (tiedGroups?.length ?? 0) === 0 && (
          <button
            onClick={() => setShowFinishConfirm(true)}
            className="flex items-center gap-2 bg-[var(--quiz-gold)] text-[var(--quiz-dark)] font-bold px-4 py-2.5 rounded-lg hover:bg-yellow-400 transition-all text-sm"
          >
            <Flag className="w-4 h-4" /> ENCERRAR
          </button>
        )}
      </div>

      {/* Tiebreaker zone */}
      {allRoundsDone && (tiedGroups?.length ?? 0) > 1 && !tiebreaker?.active && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--quiz-orange)]/20 border border-[var(--quiz-orange)]/50 rounded-xl p-5 mb-6 text-center"
        >
          <Swords className="w-8 h-8 text-[var(--quiz-orange)] mx-auto mb-2" />
          <p className="text-white font-bold text-lg mb-1">Empate detectado!</p>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">
            {tiedGroups?.map((id: string) => groups?.[id]?.name ?? '').join(', ')} estão empatados.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleStartTiebreaker}
              className="bg-[var(--quiz-orange)] text-white font-bold px-4 py-2 rounded-lg hover:bg-orange-600 transition text-sm"
            >
              <Swords className="w-4 h-4 inline mr-1" /> Iniciar rodadas extras
            </button>
            <button
              onClick={handleEndTie}
              className="bg-[hsl(var(--secondary))] text-white font-bold px-4 py-2 rounded-lg hover:bg-[hsl(var(--secondary))]/80 transition text-sm"
            >
              Encerrar Empatado
            </button>
            <button
              onClick={handleRandomWinner}
              className="bg-[var(--quiz-gold)] text-[var(--quiz-dark)] font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition text-sm"
            >
              <Dice6 className="w-4 h-4 inline mr-1" /> Sortear Ganhador
            </button>
          </div>
        </motion.div>
      )}

      {/* Tiebreaker active */}
      {tiebreaker?.active && (
        <TiebreakerPanel
          tiebreaker={tiebreaker}
          groups={groups}
          sessionId={sessionId}
          play={play}
          onEndTie={handleEndTie}
          onRandomWinner={handleRandomWinner}
        />
      )}

      {/* Round indicator */}
      {!allRoundsDone && !isFinished && (
        <motion.div
          key={`round-${currentRound}-${currentGroupIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-4"
        >
          <span className="text-[hsl(var(--muted-foreground))] text-sm">
            Rodada <span className="text-white font-bold">{currentRound}</span>/{totalRounds} — Valendo <span className="text-[var(--quiz-gold)] font-bold">{currentPoints} pts</span>
            {currentGroupId && !allAnswered && (
              <> — Vez de <span className="text-[var(--quiz-gold)] font-bold">{groups?.[currentGroupId]?.name ?? ''}</span></>
            )}
            {allAnswered && currentRound <= totalRounds && (
              <span className="text-[var(--quiz-green)]"> — Todos responderam! Avançando...</span>
            )}
          </span>
        </motion.div>
      )}

      <AnimatePresence>
        {showTurnModal && quizStarted && currentGroupId && !allAnswered && !isFinished && !tiebreaker?.active && groups[currentGroupId] && (
          <CurrentTurnModal
            group={groups[currentGroupId]}
            groupId={currentGroupId}
            round={currentRound}
            points={currentPoints}
            config={config}
            bibleTimer={bibleTimer}
            bibleTimerGroupId={bibleTimerGroupId}
            onAnswer={handleMark}
            onUseHelp={handleUseHelp}
            onUndoHelp={handleUndoHelp}
            onClose={() => setShowTurnModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Group cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groupOrder?.map((gid: string) => {
          const group = groups?.[gid];
          if (!group) return null;
          const isCurrent = gid === currentGroupId && !allAnswered && !isFinished;
          const helpsUsed = group?.helpsUsed ?? [];
          const helpsRemaining = group?.helpsRemaining ?? 0;

          return (
            <motion.div
              key={gid}
              ref={isCurrent ? currentGroupRef : undefined}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[var(--quiz-card)] border rounded-xl overflow-hidden transition-all ${
                isCurrent
                  ? 'border-[var(--quiz-gold)] animate-pulse-gold'
                  : 'border-[hsl(var(--border))]'
              }`}
            >
              {/* Group header */}
              <div className={`p-3 flex items-center gap-2 ${
                isCurrent ? 'bg-[var(--quiz-blue)]' : 'bg-[var(--quiz-dark)]/50'
              }`}>
                {editingGroup === gid ? (
                  <input
                    value={editName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e?.target?.value ?? '')}
                    onBlur={() => handleSaveGroupName(gid)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e?.key === 'Enter') handleSaveGroupName(gid); }}
                    className="flex-1 bg-transparent border-b border-[var(--quiz-gold)] text-white font-bold px-1 py-0.5 focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => { setEditingGroup(gid); setEditName(group?.name ?? ''); }}
                    className="flex-1 text-left text-white font-bold truncate hover:text-[var(--quiz-gold)] transition"
                  >
                    {group?.name ?? '---'}
                  </button>
                )}
                <button
                  onClick={() => handleSaveGroupName(gid)}
                  className={`p-1.5 rounded-md transition ${editingGroup === gid ? 'bg-[var(--quiz-green)] text-white' : 'text-[var(--quiz-green)] hover:bg-[var(--quiz-green)]/20'}`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeGroup(sessionId, gid)}
                  className="p-1.5 rounded-md text-[var(--quiz-red)] hover:bg-[var(--quiz-red)]/20 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Helps */}
              <div className="px-3 pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-bold">AJUDAS</p>
                  {isCurrent && bibleTimerGroupId === gid && <span className="text-xs font-bold text-[var(--quiz-gold)]">Bíblia: {bibleTimer}s</span>}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.entries(config?.helpsEnabled ?? {})?.map(([key, enabled]: [string, any]) => {
                    if (!enabled) return null;
                    const used = helpsUsed?.filter((h: HelpUsage) => h?.type === key);
                    const isUsed = (used?.length ?? 0) > 0;
                    const canUse = helpsRemaining > 0 && !isUsed && isCurrent;
                    const canUndo = key === 'doubleScore'
                      ? (isUsed && isCurrent && group?.doubleActive === true)
                      : (isUsed && isCurrent);
                    const isDoubleActive = key === 'doubleScore' && group?.doubleActive;

                    return (
                      <button
                        key={key}
                        onClick={() => {
                          if (canUndo) handleUndoHelp(gid, key);
                          else if (canUse) handleUseHelp(gid, key);
                        }}
                        disabled={!canUse && !canUndo}
                        title={canUndo ? 'Clique para desfazer o uso desta ajuda' : undefined}
                        className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                          isDoubleActive
                            ? 'bg-[var(--quiz-gold)] text-[var(--quiz-dark)] animate-pulse-gold'
                            : isUsed
                              ? canUndo
                                ? 'bg-[var(--quiz-orange)]/30 text-[var(--quiz-orange)] hover:bg-[var(--quiz-orange)]/50 cursor-pointer'
                                : 'bg-[var(--quiz-orange)]/30 text-[var(--quiz-orange)]'
                              : canUse
                                ? 'bg-[var(--quiz-green)] text-white hover:bg-green-600 cursor-pointer'
                                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                        }`}
                      >
                        {canUndo && <RotateCcw className="w-3 h-3" />}
                        {HELP_LABELS[key] ?? key}
                        {isUsed && (
                          <span>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>


              {/* Rounds */}
              <div className="px-3 pb-3">
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-bold mb-1.5">RODADAS</p>
                <div className="space-y-1">
                  {Array.from({ length: totalRounds }, (_, i: number) => i + 1)?.map((round: number) => {
                    const scoreKey = `round${round}`;
                    const score = group?.scores?.[scoreKey];
                    const answered = score !== undefined && score !== null;
                    const isCurrentRound = round === currentRound && isCurrent;

                    return (
                      <div
                        key={round}
                        className={`flex items-center gap-2 py-1.5 px-2 rounded-md ${
                          isCurrentRound ? 'bg-[var(--quiz-gold)]/10' : ''
                        }`}
                      >
                        <span className="text-sm text-[hsl(var(--muted-foreground))] font-mono w-20">Rodada {round}</span>
                        <div className="flex-1" />
                        {answered ? (
                          <>
                            <span className={`text-sm font-bold font-mono ${
                              (score ?? 0) > 0 ? 'text-[var(--quiz-green)]' : 'text-[var(--quiz-red)]'
                            }`}>
                              {(score ?? 0) > 0 ? `+${score}` : '0'}
                            </span>
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                              (score ?? 0) > 0 ? 'bg-[var(--quiz-green)]' : 'bg-[var(--quiz-red)]'
                            }`}>
                              {(score ?? 0) > 0 ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
                            </div>
                          </>
                        ) : isCurrentRound ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleMark(gid, round, true)}
                              className="w-8 h-8 rounded-md bg-[var(--quiz-green)] text-white flex items-center justify-center hover:bg-green-600 transition"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMark(gid, round, false)}
                              className="w-8 h-8 rounded-md bg-[var(--quiz-red)] text-white flex items-center justify-center hover:bg-red-700 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <div className="w-7 h-7 rounded-md bg-[hsl(var(--muted))] flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]/50" />
                            </div>
                            <div className="w-7 h-7 rounded-md bg-[hsl(var(--muted))] flex items-center justify-center">
                              <X className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]/50" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="mt-3 pt-2 border-t border-[hsl(var(--border))] flex items-center justify-between">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Rodadas: <span className="text-white font-bold font-mono">{group?.total ?? 0}</span>
                  </div>
                </div>
                <div className="mt-2 bg-[var(--quiz-gold)]/20 rounded-lg py-2 text-center">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">TOTAL: </span>
                  <span className="text-[var(--quiz-gold)] font-bold font-mono text-2xl">{group?.total ?? 0}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Shuffle animation */}
      <AnimatePresence>
        {showShuffle && <ShuffleAnimation groups={groups} order={shuffleOrder ?? undefined} />}
      </AnimatePresence>

      <AnimatePresence>
        {showNewGroup && <NewGroupModal onClose={() => setShowNewGroup(false)} onCreate={handleCreateGroup} />}
      </AnimatePresence>

      {/* Clear confirm */}
      <AnimatePresence>
        {showClearConfirm && (
          <ConfirmModal
            title="Limpar Sessão"
            message="Isso vai apagar grupos, pontuações, ajudas, ordem e desempates desta sessão. Deseja continuar?"
            confirmLabel="Apagar tudo"
            variant="danger"
            onConfirm={async () => { await clearSession(sessionId); setShowClearConfirm(false); }}
            onCancel={() => setShowClearConfirm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFinishConfirm && (
          <ConfirmModal
            title="Encerrar Sessão"
            message="Deseja encerrar esta sessão? Ela ficará visível no histórico."
            confirmLabel="Encerrar"
            variant="warning"
            onConfirm={async () => { await finishSession(sessionId); setShowFinishConfirm(false); }}
            onCancel={() => setShowFinishConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Tiebreaker sub-component
function TiebreakerPanel({
  tiebreaker, groups, sessionId, play, onEndTie, onRandomWinner
}: {
  tiebreaker: any;
  groups: Record<string, GroupData>;
  sessionId: string;
  play: (s: any) => void;
  onEndTie: () => void;
  onRandomWinner: () => void;
}) {
  const [tbRound, setTbRound] = useState(1);
  const tbGroups = tiebreaker?.groups ?? [];

  const handleTbAnswer = async (groupId: string, correct: boolean) => {
    play(correct ? 'correct' : 'wrong');
    const winner = await tiebreakerAnswer(sessionId, groupId, tbRound, correct);
    if (winner) {
      play('winner');
      await finishSession(sessionId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--quiz-orange)]/10 border border-[var(--quiz-orange)]/40 rounded-xl p-5 mb-6"
    >
      <div className="text-center mb-4">
        <Swords className="w-8 h-8 text-[var(--quiz-orange)] mx-auto mb-2" />
        <p className="text-white font-bold text-lg">DESEMPATE - Rodada {tbRound}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-4">
        {tbGroups?.map((gid: string) => {
          const group = groups?.[gid];
          const roundData = tiebreaker?.rounds?.[`tb${tbRound}`];
          const answered = roundData?.[gid] !== undefined && roundData?.[gid] !== null;

          return (
            <div key={gid} className="bg-[var(--quiz-card)] rounded-lg p-4 min-w-[200px]">
              <p className="text-white font-bold mb-3 text-center">{group?.name ?? '---'}</p>
              {answered ? (
                <div className={`text-center font-bold text-lg ${
                  roundData?.[gid] === 1 ? 'text-[var(--quiz-green)]' : 'text-[var(--quiz-red)]'
                }`}>
                  {roundData?.[gid] === 1 ? '✅ Acertou' : '❌ Errou'}
                </div>
              ) : (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleTbAnswer(gid, true)}
                    className="w-10 h-10 rounded-lg bg-[var(--quiz-green)] text-white flex items-center justify-center hover:bg-green-600 transition"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleTbAnswer(gid, false)}
                    className="w-10 h-10 rounded-lg bg-[var(--quiz-red)] text-white flex items-center justify-center hover:bg-red-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => setTbRound((r: number) => r + 1)}
          disabled={!tbGroups.every((gid: string) => {
            const value = tiebreaker?.rounds?.[`tb${tbRound}`]?.[gid];
            return value !== undefined && value !== null;
          })}
          className="text-sm text-white bg-[var(--quiz-purple)] px-3 py-2 rounded-lg hover:bg-purple-600 transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          Próxima Rodada Desempate
        </button>
        <button
          onClick={onEndTie}
          className="text-sm bg-[hsl(var(--secondary))] text-white px-3 py-2 rounded-lg hover:bg-[hsl(var(--secondary))]/80 transition"
        >
          Encerrar Empatado
        </button>
        <button
          onClick={onRandomWinner}
          className="text-sm bg-[var(--quiz-gold)] text-[var(--quiz-dark)] font-bold px-3 py-2 rounded-lg hover:bg-yellow-400 transition"
        >
          Sortear Ganhador
        </button>
      </div>
    </motion.div>
  );
}
