import { GroupData, TiebreakerData } from '@/types/quiz';

export interface RankedGroup {
  id: string;
  group: GroupData;
  tiebreakerWins: number;
}

export function getTiebreakerWins(tiebreaker: TiebreakerData | undefined, groupId: string): number {
  if (!tiebreaker?.groups?.includes(groupId)) return 0;
  return Object.values(tiebreaker.rounds ?? {}).reduce((wins, round) => wins + (round?.[groupId] === 1 ? 1 : 0), 0);
}

export function rankGroups(groups: Record<string, GroupData>, tiebreaker?: TiebreakerData | null): RankedGroup[] {
  return Object.entries(groups ?? {})
    .map(([id, group]) => ({ id, group, tiebreakerWins: getTiebreakerWins(tiebreaker ?? undefined, id) }))
    .sort((first, second) => {
      const totalDifference = (second.group.total ?? 0) - (first.group.total ?? 0);
      if (totalDifference !== 0) return totalDifference;
      return second.tiebreakerWins - first.tiebreakerWins;
    });
}
