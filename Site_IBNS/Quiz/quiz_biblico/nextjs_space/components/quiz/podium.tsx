'use client';

import { GroupData } from '@/types/quiz';
import { rankGroups } from '@/lib/ranking';
import { motion } from 'framer-motion';

interface PodiumProps {
  groups: Record<string, GroupData>;
  tiebreakerWinner?: string | null;
  tiebreaker?: import('@/types/quiz').TiebreakerData;
}

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const MEDAL_BG = [
  'bg-gradient-to-r from-yellow-600/30 to-yellow-500/20 border-yellow-500/50',
  'bg-gradient-to-r from-gray-400/20 to-gray-300/15 border-gray-400/40',
  'bg-gradient-to-r from-orange-700/20 to-orange-600/15 border-orange-600/40',
];
const MEDAL_EMOJI = ['🥇', '🥈', '🥉'];

export function Podium({ groups, tiebreakerWinner, tiebreaker }: PodiumProps) {
  const sorted = rankGroups(groups, tiebreaker)
    .sort((a, b) => {
      if (tiebreakerWinner && tiebreakerWinner !== 'tie') {
        if (a.id === tiebreakerWinner) return -1;
        if (b.id === tiebreakerWinner) return 1;
      }
      return 0;
    });

  const top3 = sorted?.slice(0, 3) ?? [];
  const positions: number[] = [];
  top3.forEach((group: any, index: number) => {
    positions[index] = index === 0 || (group.group.total ?? 0) !== (top3[index - 1]?.group.total ?? 0) || group.tiebreakerWins !== (top3[index - 1]?.tiebreakerWins ?? 0)
      ? index + 1
      : positions[index - 1];
  });

  if (top3?.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6">
      {top3?.map((group: any, index: number) => (
        <motion.div
          key={group?.id ?? index}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${MEDAL_BG[positions[index] - 1] ?? MEDAL_BG[2]} min-w-[180px]`}
        >
          <span className="text-2xl">{MEDAL_EMOJI[positions[index] - 1] ?? ''}</span>
          <div className="flex-1">
            <p className="text-white font-bold text-sm truncate">{group.group?.name ?? '---'}</p>
            <p className="text-[hsl(var(--muted-foreground))] text-xs">Posição {positions[index]}º</p>
          </div>
          <div className="font-mono font-bold text-xl" style={{ color: MEDAL_COLORS[positions[index] - 1] ?? '#CD7F32' }}>
            {group.group?.total ?? 0}
            <span className="text-xs font-normal ml-0.5">pts</span>
            {group.tiebreakerWins > 0 && <span className="ml-1 text-xs font-normal">({group.tiebreakerWins})</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
