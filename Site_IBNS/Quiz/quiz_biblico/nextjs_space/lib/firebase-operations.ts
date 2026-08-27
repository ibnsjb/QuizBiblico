import { ref, set, push, update, remove, onValue, off, get } from 'firebase/database';
import { database } from './firebase';
import { SessionData, GroupData, SessionConfig, DEFAULT_CONFIG, HelpUsage } from '@/types/quiz';

// --- Sessions ---

export function listenToSessions(callback: (sessions: Record<string, SessionData>) => void) {
  if (!database) return () => {};
  const sessionsRef = ref(database, 'sessions');
  const handler = onValue(sessionsRef, (snapshot) => {
    callback(snapshot?.val() ?? {});
  });
  return () => off(sessionsRef);
}

export function listenToSession(sessionId: string, callback: (session: SessionData | null) => void) {
  if (!database) return () => {};
  const sessionRef = ref(database, `sessions/${sessionId}`);
  onValue(sessionRef, (snapshot) => {
    callback(snapshot?.val() ?? null);
  });
  return () => off(sessionRef);
}

export async function createSession(name: string, date: string, config?: SessionConfig): Promise<string> {
  if (!database) throw new Error('Firebase not initialized');
  const sessionsRef = ref(database, 'sessions');
  const newRef = push(sessionsRef);
  const session: SessionData = {
    name,
    date,
    status: 'active',
    currentRound: 1,
    currentGroupIndex: 0,
    totalRounds: config?.totalRounds ?? DEFAULT_CONFIG.totalRounds,
    config: config ?? DEFAULT_CONFIG,
    groups: {},
    createdAt: Date.now(),
  };
  await set(newRef, session);
  return newRef?.key ?? '';
}

export async function updateSessionConfig(sessionId: string, config: SessionConfig) {
  if (!database) return;
  await update(ref(database, `sessions/${sessionId}`), {
    config,
    totalRounds: config.totalRounds,
  });
}

export async function finishSession(sessionId: string) {
  if (!database) return;
  await update(ref(database, `sessions/${sessionId}`), { status: 'finished' });
}

export async function deleteSession(sessionId: string) {
  if (!database) return;
  await remove(ref(database, `sessions/${sessionId}`));
}

// --- Groups ---

export async function addGroup(sessionId: string, name: string) {
  if (!database) return;
  const groupsRef = ref(database, `sessions/${sessionId}/groups`);
  const snapshot = await get(groupsRef);
  const groups = snapshot?.val() ?? {};
  const order = Object.keys(groups)?.length ?? 0;
  const newRef = push(groupsRef);
  const group: GroupData = {
    name,
    order,
    scores: {},
    helpsUsed: [],
    helpsRemaining: 0,
    doubleActive: false,
    total: 0,
  };
  // Get current session config for helpsPerGroup
  const sessionSnap = await get(ref(database, `sessions/${sessionId}/config/helpsPerGroup`));
  group.helpsRemaining = sessionSnap?.val() ?? DEFAULT_CONFIG.helpsPerGroup;
  await set(newRef, group);
}

export async function removeGroup(sessionId: string, groupId: string) {
  if (!database) return;
  await remove(ref(database, `sessions/${sessionId}/groups/${groupId}`));
}

export async function updateGroupName(sessionId: string, groupId: string, name: string) {
  if (!database) return;
  await update(ref(database, `sessions/${sessionId}/groups/${groupId}`), { name });
}

// --- Scoring ---

function getPointsForRound(round: number, config: SessionConfig): number {
  const ranges = config?.scoringRanges ?? [];
  for (const range of ranges) {
    if (round >= (range?.startRound ?? 0) && round <= (range?.endRound ?? 0)) {
      return range?.points ?? 10;
    }
  }
  return config?.defaultPoints ?? DEFAULT_CONFIG.defaultPoints;
}

export async function markAnswer(sessionId: string, groupId: string, round: number, correct: boolean) {
  if (!database) return;
  const sessionSnap = await get(ref(database, `sessions/${sessionId}`));
  const session: SessionData | null = sessionSnap?.val();
  if (!session) return;
  
  const group = session?.groups?.[groupId];
  if (!group) return;
  
  const points = getPointsForRound(round, session?.config ?? DEFAULT_CONFIG);
  const isDouble = group?.doubleActive === true;
  const score = correct ? (isDouble ? points * 2 : points) : 0;
  
  const updates: Record<string, any> = {};
  updates[`sessions/${sessionId}/groups/${groupId}/scores/round${round}`] = score;
  updates[`sessions/${sessionId}/groups/${groupId}/doubleActive`] = false;
  
  // Recalculate total
  const scores = { ...(group?.scores ?? {}), [`round${round}`]: score };
  let total = 0;
  for (const key of Object.keys(scores)) {
    const val = scores[key];
    if (typeof val === 'number') total += val;
  }
  updates[`sessions/${sessionId}/groups/${groupId}/total`] = total;
  
  await update(ref(database), updates);
}

export async function undoLastAnswer(sessionId: string) {
  if (!database) return;
  const sessionSnap = await get(ref(database, `sessions/${sessionId}`));
  const session: SessionData | null = sessionSnap?.val();
  if (!session) return;
  if (session?.status === 'finished') return;

  const groupIds = session?.groupOrder ?? Object.keys(session?.groups ?? {});
  const len = groupIds?.length ?? 0;
  if (len === 0) return;

  const curRound = session?.currentRound ?? 1;
  const curIndex = session?.currentGroupIndex ?? 0;

  // Compute the previous (last answered) position
  let prevRound: number;
  let prevIndex: number;
  if (curIndex > 0) {
    prevRound = curRound;
    prevIndex = curIndex - 1;
  } else {
    prevRound = curRound - 1;
    prevIndex = len - 1;
  }
  if (prevRound < 1) return; // nothing to undo

  const targetGroupId = groupIds[prevIndex];
  const group = session?.groups?.[targetGroupId];
  if (!group) return;

  const scoreKey = `round${prevRound}`;
  const prevScore = group?.scores?.[scoreKey];
  if (prevScore === undefined || prevScore === null) {
    // Nothing marked here, just move the pointer back
    await update(ref(database, `sessions/${sessionId}`), {
      currentRound: prevRound,
      currentGroupIndex: prevIndex,
    });
    return;
  }

  // Clear the score and recalculate total
  const scores: Record<string, any> = { ...(group?.scores ?? {}) };
  scores[scoreKey] = null;
  let total = 0;
  for (const key of Object.keys(scores)) {
    const val = scores[key];
    if (typeof val === 'number') total += val;
  }

  // If this round used Dobrar Acerto, restore it as pending so it can be undone
  const usedDoubleThisRound = (group?.helpsUsed ?? []).some(
    (h) => h?.type === 'doubleScore' && h?.round === prevRound
  );

  const updates: Record<string, any> = {};
  updates[`sessions/${sessionId}/groups/${targetGroupId}/scores/${scoreKey}`] = null;
  updates[`sessions/${sessionId}/groups/${targetGroupId}/total`] = total;
  if (usedDoubleThisRound) {
    updates[`sessions/${sessionId}/groups/${targetGroupId}/doubleActive`] = true;
  }
  updates[`sessions/${sessionId}/currentRound`] = prevRound;
  updates[`sessions/${sessionId}/currentGroupIndex`] = prevIndex;

  await update(ref(database), updates);
}

export async function advanceRound(sessionId: string) {
  if (!database) return;
  const sessionSnap = await get(ref(database, `sessions/${sessionId}`));
  const session: SessionData | null = sessionSnap?.val();
  if (!session) return;
  
  const groupIds = session?.groupOrder ?? Object.keys(session?.groups ?? {});
  const nextIndex = (session?.currentGroupIndex ?? 0) + 1;
  
  if (nextIndex >= (groupIds?.length ?? 0)) {
    // All groups answered this round, move to next round
    const nextRound = (session?.currentRound ?? 1) + 1;
    if (nextRound > (session?.totalRounds ?? 8)) {
      // All rounds done
      await update(ref(database, `sessions/${sessionId}`), {
        currentRound: session?.currentRound ?? 1,
        currentGroupIndex: groupIds?.length ?? 0,
      });
    } else {
      await update(ref(database, `sessions/${sessionId}`), {
        currentRound: nextRound,
        currentGroupIndex: 0,
      });
    }
  } else {
    await update(ref(database, `sessions/${sessionId}`), {
      currentGroupIndex: nextIndex,
    });
  }
}

// --- Helps ---

export async function useHelp(sessionId: string, groupId: string, helpType: string, round: number, extra?: Record<string, any>) {
  if (!database) return;
  const groupRef = ref(database, `sessions/${sessionId}/groups/${groupId}`);
  const snapshot = await get(groupRef);
  const group: GroupData | null = snapshot?.val();
  if (!group) return;
  
  const helpUsage: HelpUsage = {
    type: helpType as HelpUsage['type'],
    round,
    ...(extra ?? {}),
  };
  
  const helpsUsed = [...(group?.helpsUsed ?? []), helpUsage];
  const helpsRemaining = Math.max(0, (group?.helpsRemaining ?? 1) - 1);
  
  const updates: Record<string, any> = {
    helpsUsed,
    helpsRemaining,
  };
  
  if (helpType === 'doubleScore') {
    updates.doubleActive = true;
  }
  
  await update(groupRef, updates);
}

export async function undoHelp(sessionId: string, groupId: string, helpType: string) {
  if (!database) return;
  const groupRef = ref(database, `sessions/${sessionId}/groups/${groupId}`);
  const snapshot = await get(groupRef);
  const group: GroupData | null = snapshot?.val();
  if (!group) return;

  const helpsUsed = [...(group?.helpsUsed ?? [])];
  // Remove the last usage of this help type
  let removedIndex = -1;
  for (let i = helpsUsed.length - 1; i >= 0; i--) {
    if (helpsUsed[i]?.type === helpType) {
      removedIndex = i;
      break;
    }
  }
  if (removedIndex === -1) return; // nothing to undo
  helpsUsed.splice(removedIndex, 1);

  const helpsRemaining = (group?.helpsRemaining ?? 0) + 1;

  const updates: Record<string, any> = {
    helpsUsed,
    helpsRemaining,
  };

  if (helpType === 'doubleScore') {
    updates.doubleActive = false;
  }

  await update(groupRef, updates);
}

// --- Shuffle ---

export async function shuffleGroups(sessionId: string) {
  if (!database) return;
  const groupsSnap = await get(ref(database, `sessions/${sessionId}/groups`));
  const groups = groupsSnap?.val() ?? {};
  const ids = Object.keys(groups);
  
  // Fisher-Yates shuffle
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  
  const updates: Record<string, any> = {
    [`sessions/${sessionId}/groupOrder`]: ids,
    [`sessions/${sessionId}/currentGroupIndex`]: 0,
    [`sessions/${sessionId}/currentRound`]: 1,
  };
  
  // Update order on each group
  ids.forEach((id: string, index: number) => {
    updates[`sessions/${sessionId}/groups/${id}/order`] = index;
  });
  
  await update(ref(database), updates);
  return ids;
}

// --- Tiebreaker ---

export async function startTiebreaker(sessionId: string, groupIds: string[]) {
  if (!database) return;
  const sessionSnap = await get(ref(database, `sessions/${sessionId}`));
  const session: SessionData | null = sessionSnap?.val();
  if (!session) return;
  const updates: Record<string, any> = {
    [`sessions/${sessionId}/tiebreaker`]: {
    active: true,
    groups: groupIds,
    rounds: {},
    winner: null,
    },
  };
  for (const groupId of groupIds) {
    updates[`sessions/${sessionId}/groups/${groupId}/helpsUsed`] = [];
    updates[`sessions/${sessionId}/groups/${groupId}/helpsRemaining`] = 0;
    updates[`sessions/${sessionId}/groups/${groupId}/doubleActive`] = false;
  }
  await update(ref(database), updates);
}

export async function tiebreakerAnswer(sessionId: string, groupId: string, tbRound: number, correct: boolean) {
  if (!database) return;
  await update(ref(database, `sessions/${sessionId}/tiebreaker/rounds/tb${tbRound}`), {
    [groupId]: correct ? 1 : 0,
  });
}

export async function endTiebreaker(sessionId: string, winner: string) {
  if (!database) return;
  await update(ref(database, `sessions/${sessionId}/tiebreaker`), {
    active: false,
    winner,
  });
}

export async function clearSession(sessionId: string) {
  if (!database) return;
  const sessionSnap = await get(ref(database, `sessions/${sessionId}`));
  const session: SessionData | null = sessionSnap?.val();
  if (!session) return;
  
  const updates: Record<string, any> = {
    currentRound: 1,
    currentGroupIndex: 0,
    tiebreaker: null,
    groupOrder: null,
    groups: null,
  };
  
  await update(ref(database, `sessions/${sessionId}`), updates);
}
