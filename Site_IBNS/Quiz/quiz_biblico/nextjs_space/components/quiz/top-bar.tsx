'use client';

import { ViewMode } from '@/types/quiz';
import { Tv, Settings, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface TopBarProps {
  mode: ViewMode;
  onSwitchToPresenter?: () => void;
  onSwitchToPublic?: () => void;
  sessionName?: string;
  rightContent?: React.ReactNode;
}

export function TopBar({ mode, onSwitchToPresenter, onSwitchToPublic, sessionName, rightContent }: TopBarProps) {
  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--quiz-dark)]/90 backdrop-blur-md border-b border-[hsl(var(--border))]"
    >
      <div className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-3 px-[3%]">
        <Link href="/placar" className="flex min-w-0 items-center gap-2" aria-label="Ir para o placar">
          <Image
            src="/logo-ibns-oficial.png"
            alt="Logo Igreja Batista Nova Sião"
            width={64}
            height={64}
            className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11"
            priority
          />
          <span className="min-w-0 font-display text-base font-bold sm:text-lg">
            <span className="text-[var(--quiz-gold)]">Quiz</span>{' '}
            <span className="text-white">Bíblico</span>
          </span>
          {sessionName && (
            <span className="text-[hsl(var(--muted-foreground))] text-sm hidden md:inline">
              — {sessionName}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          {mode === 'apresentador' ? (
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--quiz-purple)] text-white" title="Modo apresentador" aria-label="Modo apresentador">
                <Crown className="w-3.5 h-3.5" />
              </span>
              {onSwitchToPublic && (
                <button
                  onClick={onSwitchToPublic}
                  className="text-xs text-[hsl(var(--muted-foreground))] hover:text-white transition-colors px-2 py-1"
                >
                  <Tv className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 bg-[var(--quiz-green)]/20 text-[var(--quiz-green)] text-xs font-bold px-3 py-1.5 rounded-full">
                <Tv className="w-3.5 h-3.5" />
                PÚBLICO
              </span>
              {onSwitchToPresenter && (
                <button
                  onClick={onSwitchToPresenter}
                  className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[var(--quiz-gold)] transition-colors p-2"
                  title="Entrar como Apresentador"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          {rightContent}
        </div>
      </div>
    </motion.header>
  );
}
