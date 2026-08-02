'use client';

import { useState, useEffect } from 'react';
import { ViewMode } from '@/types/quiz';

const STORAGE_KEY = 'quiz-biblico-view-mode';

export function useViewMode() {
  const [mode, setModeState] = useState<ViewMode>('publico');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage?.getItem(STORAGE_KEY);
      if (stored === 'apresentador' || stored === 'publico') {
        setModeState(stored);
      }
    } catch {}
  }, []);

  const setMode = (newMode: ViewMode) => {
    setModeState(newMode);
    try {
      localStorage?.setItem(STORAGE_KEY, newMode);
    } catch {}
  };

  return { mode, setMode, mounted };
}
