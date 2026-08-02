'use client';

import { useState, useEffect, useMemo } from 'react';
import { useViewMode } from '@/hooks/use-view-mode';
import { useSound } from '@/hooks/use-sound';
import { listenToSession } from '@/lib/firebase-operations';
import { SessionData, ViewMode } from '@/types/quiz';
import { TopBar } from './top-bar';
import { PresenterView } from './presenter-view';
import { PublicView } from './public-view';
import { ConfirmModal } from './confirm-modal';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX, Settings } from 'lucide-react';
import { ConfigModal } from './config-modal';

interface SessionClientProps {
  sessionId: string;
}

export default function SessionClient({ sessionId }: SessionClientProps) {
  const { mode, setMode, mounted } = useViewMode();
  const { muted, setMuted, play } = useSound();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModeConfirm, setShowModeConfirm] = useState(false);
  const [modeConfirmStep, setModeConfirmStep] = useState(0);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    const unsub = listenToSession(sessionId, (data: SessionData | null) => {
      setSession(data);
      setLoading(false);
    });
    return unsub;
  }, [sessionId]);

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

  if (!mounted || loading) {
    return (
      <div className="min-h-screen quiz-gradient flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--quiz-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen quiz-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-2">Sessão não encontrada</p>
          <a href="/" className="text-[var(--quiz-gold)] hover:underline">Voltar ao início</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen quiz-gradient">
      <TopBar
        mode={mode}
        onSwitchToPresenter={handleSwitchToPresenter}
        onSwitchToPublic={() => setMode('publico')}
        sessionName={session?.name ?? ''}
        rightContent={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMuted(!muted)}
              className="p-2 text-[hsl(var(--muted-foreground))] hover:text-white transition-colors rounded-lg"
              title={muted ? 'Ativar som' : 'Silenciar'}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            {mode === 'apresentador' && (
              <button
                onClick={() => setShowConfig(true)}
                className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[var(--quiz-gold)] transition-colors rounded-lg"
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 pt-20 pb-12">
        {mode === 'apresentador' ? (
          <PresenterView session={session} sessionId={sessionId} play={play} />
        ) : (
          <PublicView session={session} />
        )}
      </main>

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

      <AnimatePresence>
        {showConfig && (
          <ConfigModal
            sessionId={sessionId}
            config={session?.config}
            onClose={() => setShowConfig(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
