export interface ScoringRange {
  startRound: number;
  endRound: number;
  points: number;
}

export interface SessionConfig {
  totalRounds: number;
  scoringRanges: ScoringRange[];
  helpsEnabled: {
    eliminateAnswer: boolean;
    churchHelp: boolean;
    bibleConsult: boolean;
    doubleScore: boolean;
  };
  helpsPerGroup: number;
  soundEnabled: boolean;
}

export interface HelpUsage {
  type: 'eliminateAnswer' | 'churchHelp' | 'bibleConsult' | 'doubleScore';
  round: number;
  eliminated?: string; // e.g. 'A', 'B', 'C', 'D'
}

export interface GroupData {
  name: string;
  order: number;
  scores: Record<string, number | null>; // round1: 10, round2: 0, round3: null (not answered)
  helpsUsed: HelpUsage[];
  helpsRemaining: number;
  doubleActive: boolean; // true if double is active for current round
  total: number;
}

export interface TiebreakerData {
  active: boolean;
  groups: string[];
  rounds: Record<string, Record<string, number | null>>; // round -> groupId -> score
  winner: string | null; // groupId, 'tie', or null
}

export interface SessionData {
  name: string;
  date: string;
  status: 'active' | 'finished';
  currentRound: number;
  currentGroupIndex: number;
  totalRounds: number;
  config: SessionConfig;
  groups: Record<string, GroupData>;
  tiebreaker?: TiebreakerData;
  groupOrder?: string[]; // ordered group IDs after shuffle
  createdAt: number;
}

export type ViewMode = 'apresentador' | 'publico';

export const HELP_LABELS: Record<string, string> = {
  eliminateAnswer: 'Eliminar Resposta',
  churchHelp: 'Ajuda da Igreja',
  bibleConsult: 'Consultar Bíblia',
  doubleScore: 'Dobrar Acerto',
};

export const DEFAULT_CONFIG: SessionConfig = {
  totalRounds: 8,
  scoringRanges: [
    { startRound: 1, endRound: 3, points: 10 },
    { startRound: 4, endRound: 6, points: 20 },
    { startRound: 7, endRound: 9, points: 30 },
  ],
  helpsEnabled: {
    eliminateAnswer: true,
    churchHelp: true,
    bibleConsult: true,
    doubleScore: true,
  },
  helpsPerGroup: 3,
  soundEnabled: true,
};
