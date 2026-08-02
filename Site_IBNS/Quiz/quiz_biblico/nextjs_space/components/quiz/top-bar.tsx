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
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo-ibns-branco.png"
            alt="Logo Igreja Batista Nova Sião"
            width={40}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
          <span className="font-display font-bold text-lg">
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
              <span className="flex items-center gap-1 bg-[var(--quiz-purple)] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                <Crown className="w-3.5 h-3.5" />
                APRESENTADOR
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
