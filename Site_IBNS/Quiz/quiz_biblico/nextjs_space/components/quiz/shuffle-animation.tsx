'use client';

import { motion } from 'framer-motion';
import { GroupData } from '@/types/quiz';
import { Shuffle } from 'lucide-react';

interface ShuffleAnimationProps {
  groups: Record<string, GroupData>;
  order?: string[];
}

export function ShuffleAnimation({ groups, order }: ShuffleAnimationProps) {
  const orderedIds = order ?? Object.keys(groups ?? {});
  const names = orderedIds?.map((id: string) => groups?.[id]?.name ?? '---');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="bg-[var(--quiz-card)] border border-[var(--quiz-gold)] rounded-2xl p-8 text-center gold-glow"
      >
        <Shuffle className="w-12 h-12 text-[var(--quiz-gold)] mx-auto mb-4 animate-spin" />
        <p className="text-white font-display font-bold text-2xl mb-4">Sorteando ordem...</p>
        <div className="flex flex-wrap justify-center gap-3">
          {names?.map((name: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.3 }}
              className="bg-[var(--quiz-gold)]/20 border border-[var(--quiz-gold)]/50 rounded-lg px-4 py-2"
            >
              <span className="text-[var(--quiz-gold)] font-mono font-bold text-sm">{i + 1}º</span>
              <span className="text-white ml-2 font-medium">{name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
