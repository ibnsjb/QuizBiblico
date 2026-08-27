'use client';

import { useState, useEffect } from 'react';
import { useViewMode } from '@/hooks/use-view-mode';
import { listenToSessions, createSession, deleteSession } from '@/lib/firebase-operations';
import { firebaseConfigured } from '@/lib/firebase';
import { SessionData, ViewMode } from '@/types/quiz';
import { SessionList } from './session-list';
import { TopBar } from './top-bar';
import { ConfirmModal } from './confirm-modal';
import { NewSessionModal } from './new-session-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tv, Settings } from 'lucide-react';
import Image from 'next/image';

export default function HomeClient() {
  const { mode, setMode, mounted } = useViewMode();
  const [sessions, setSessions] = useState<Record<string, SessionData>>({});
  const [showNewSession, setShowNewSession] = useState(false);
  const [showModeConfirm, setShowModeConfirm] = useState(false);
  const [modeConfirmStep, setModeConfirmStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) {
      setFirebaseError(true);
      setLoading(false);
      return;
    }
    try {
      const unsub = listenToSessions((data: Record<string, SessionData>) => {
        setSessions(data ?? {});
        setLoading(false);
      });
      return unsub;
    } catch {
      setFirebaseError(true);
      setLoading(false);
    }
  }, []);

  const handleCreateSession = async (name: string, date: string) => {
    try {
      await createSession(name, date);
      setShowNewSession(false);
    } catch (err: any) {
      console.error('Erro ao criar sessão:', err);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
    } catch (err: any) {
      console.error('Erro ao deletar sessão:', err);
    }
  };

  const handleSwitchToPresenter = () => {
    setModeConfirmStep(1);
    setShowModeConfirm(true);
  };

  const handleConfirmStep = () => {
    if (modeConfirmStep === 1) {
      setModeConfirmStep(2);
    } else {
      setMode('apresentador');
      setShowModeConfirm(false);
      setModeConfirmStep(0);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen quiz-gradient flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--quiz-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen quiz-gradient">
      <TopBar
        mode={mode}
        onSwitchToPresenter={handleSwitchToPresenter}
        onSwitchToPublic={() => setMode('publico')}
      />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-5">
            <Image
              src="/logo-ibns-oficial.png"
              alt="Logo Igreja Batista Nova Sião"
              width={140}
              height={140}
              className="h-28 w-auto object-contain drop-shadow-lg"
              priority
            />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-[var(--quiz-gold)]">Quiz</span>{' '}
            <span className="text-white">Bíblico</span>{' '}
            <span className="text-[var(--quiz-gold)] text-2xl md:text-3xl">IBNS</span>
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            Painel de Pontuação em Tempo Real
          </p>
        </motion.div>

        {firebaseError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[var(--quiz-red)]/20 border border-[var(--quiz-red)]/50 rounded-lg p-6 text-center mb-8"
          >
            <p className="text-white text-lg font-semibold mb-2">Firebase não configurado</p>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              Configure as variáveis de ambiente do Firebase no arquivo .env.local para começar a usar o Quiz Bíblico.
            </p>
          </motion.div>
        )}

        {mode === 'apresentador' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-8"
          >
            <button
              onClick={() => setShowNewSession(true)}
              className="flex items-center gap-2 bg-[var(--quiz-gold)] text-[var(--quiz-dark)] font-bold px-6 py-3 rounded-lg hover:bg-yellow-400 transition-all hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nova Sessão
            </button>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[var(--quiz-gold)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <SessionList
            sessions={sessions}
            mode={mode}
            onDelete={handleDeleteSession}
          />
        )}
      </main>

      <AnimatePresence>
        {showNewSession && (
          <NewSessionModal
            onClose={() => setShowNewSession(false)}
            onCreate={handleCreateSession}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModeConfirm && (
          <ConfirmModal
            title={modeConfirmStep === 1 ? 'Modo Apresentador' : 'Confirmação Final'}
            message={
              modeConfirmStep === 1
                ? 'Você está prestes a entrar como Apresentador. Isso dará controle total da sessão.'
                : 'Tem certeza? Esta ação não pode ser desfeita neste dispositivo sem recarregar a página.'
            }
            confirmLabel={modeConfirmStep === 1 ? 'Continuar' : 'Sim, entrar como Apresentador'}
            onConfirm={handleConfirmStep}
            onCancel={() => { setShowModeConfirm(false); setModeConfirmStep(0); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
