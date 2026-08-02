'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const MUTE_KEY = 'quiz-biblico-muted';

type SoundType = 'correct' | 'wrong' | 'shuffle' | 'help' | 'double' | 'winner' | 'tiebreaker';

function createOscillator(ctx: AudioContext, freq: number, type: OscillatorType, duration: number, gain: number = 0.3) {
  const osc = ctx?.createOscillator();
  const g = ctx?.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

const SOUNDS: Record<SoundType, (ctx: AudioContext) => void> = {
  correct: (ctx) => {
    createOscillator(ctx, 523, 'sine', 0.15, 0.4);
    setTimeout(() => createOscillator(ctx, 659, 'sine', 0.15, 0.4), 100);
    setTimeout(() => createOscillator(ctx, 784, 'sine', 0.3, 0.4), 200);
  },
  wrong: (ctx) => {
    createOscillator(ctx, 200, 'sawtooth', 0.4, 0.2);
    setTimeout(() => createOscillator(ctx, 150, 'sawtooth', 0.5, 0.2), 200);
  },
  shuffle: (ctx) => {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => createOscillator(ctx, 300 + Math.random() * 400, 'sine', 0.08, 0.2), i * 80);
    }
  },
  help: (ctx) => {
    createOscillator(ctx, 440, 'sine', 0.1, 0.3);
    setTimeout(() => createOscillator(ctx, 554, 'sine', 0.1, 0.3), 80);
    setTimeout(() => createOscillator(ctx, 659, 'sine', 0.2, 0.3), 160);
  },
  double: (ctx) => {
    createOscillator(ctx, 440, 'triangle', 0.15, 0.4);
    setTimeout(() => createOscillator(ctx, 660, 'triangle', 0.15, 0.4), 120);
    setTimeout(() => createOscillator(ctx, 880, 'triangle', 0.3, 0.4), 240);
  },
  winner: (ctx) => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n: number, i: number) => {
      setTimeout(() => createOscillator(ctx, n, 'sine', 0.3, 0.3), i * 150);
    });
  },
  tiebreaker: (ctx) => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createOscillator(ctx, 350 + i * 50, 'square', 0.12, 0.15), i * 120);
    }
  },
};

export function useSound() {
  const [muted, setMutedState] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage?.getItem(MUTE_KEY);
      if (stored === 'true') setMutedState(true);
    } catch {}
  }, []);

  const setMuted = useCallback((val: boolean) => {
    setMutedState(val);
    try { localStorage?.setItem(MUTE_KEY, String(val)); } catch {}
  }, []);

  const play = useCallback((sound: SoundType) => {
    if (muted) return;
    try {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      if (ctx?.state === 'suspended') ctx?.resume();
      SOUNDS[sound]?.(ctx);
    } catch {}
  }, [muted]);

  return { muted, setMuted, play };
}
