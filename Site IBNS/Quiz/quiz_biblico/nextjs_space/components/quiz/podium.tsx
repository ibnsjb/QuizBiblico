'use client';

import { GroupData } from '@/types/quiz';
import { motion } from 'framer-motion';

interface PodiumProps {
  groups: Record<string, GroupData>;
}

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const MEDAL_BG = [
  'bg-gradient-to-r from-yellow-600/30 to-yellow-500/20 border-yellow-500/50',
  'bg-gradient-to-r from-gray-400/20 to-gray-300/15 border-gray-400/40',
  'bg-gradient-to-r from-orange-700/20 to-orange-600/15 border-orange-600/40',
];
const MEDAL_EMOJI = ['🥇', '🥈', '🥉'];

export function Podium({ groups }: PodiumProps) {
  const sorted = Object.entries(groups ?? {})
    .map(([id, g]: [string, GroupData]) => ({ id, ...g }))
    .sort((a: any, b: any) => (b?.total ?? 0) - (a?.total ?? 0));

  const top3 = sorted?.slice(0, 3) ?? [];

  if (top3?.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6">
      {top3?.map((group: any, index: number) => (
        <motion.div
          key={group?.id ?? index}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${MEDAL_BG[index] ?? MEDAL_BG[2]} min-w-[180px]`}
        >
          <span className="text-2xl">{MEDAL_EMOJI[index] ?? ''}</span>
          <div className="flex-1">
            <p className="text-white font-bold text-sm truncate">{group?.name ?? '---'}</p>
            <p className="text-[hsl(var(--muted-foreground))] text-xs">Posição {index + 1}º</p>
          </div>
          <div className="font-mono font-bold text-xl" style={{ color: MEDAL_COLORS[index] ?? '#CD7F32' }}>
            {group?.total ?? 0}
            <span className="text-xs font-normal ml-0.5">pts</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
