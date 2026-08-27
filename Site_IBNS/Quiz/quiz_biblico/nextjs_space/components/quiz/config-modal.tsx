'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { SessionConfig, ScoringRange, DEFAULT_CONFIG, HELP_LABELS } from '@/types/quiz';
import { updateSessionConfig } from '@/lib/firebase-operations';

interface ConfigModalProps {
  sessionId: string;
  config?: SessionConfig;
  onClose: () => void;
}

export function ConfigModal({ sessionId, config, onClose }: ConfigModalProps) {
  const [localConfig, setLocalConfig] = useState<SessionConfig>({
    totalRounds: config?.totalRounds ?? DEFAULT_CONFIG.totalRounds,
    scoringRanges: config?.scoringRanges ?? [...DEFAULT_CONFIG.scoringRanges],
    defaultPoints: config?.defaultPoints ?? DEFAULT_CONFIG.defaultPoints,
    helpsEnabled: { ...(config?.helpsEnabled ?? DEFAULT_CONFIG.helpsEnabled) },
    helpsPerGroup: config?.helpsPerGroup ?? DEFAULT_CONFIG.helpsPerGroup,
    bibleConsultSeconds: config?.bibleConsultSeconds ?? DEFAULT_CONFIG.bibleConsultSeconds,
    soundEnabled: config?.soundEnabled ?? DEFAULT_CONFIG.soundEnabled,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSessionConfig(sessionId, {
        ...localConfig,
        helpsPerGroup: Math.min(Object.values(localConfig.helpsEnabled).filter(Boolean).length, Math.max(0, localConfig.helpsPerGroup)),
      });
      onClose();
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateRange = (index: number, field: keyof ScoringRange, value: number) => {
    const ranges = [...(localConfig?.scoringRanges ?? [])];
    if (ranges[index]) {
      ranges[index] = { ...ranges[index], [field]: value };
    }
    const normalizedRanges = ranges.map((range, rangeIndex) => ({
      ...range,
      startRound: rangeIndex === 0 ? 1 : (ranges[rangeIndex - 1]?.endRound ?? 0) + 1,
      endRound: Math.max(range?.endRound ?? 1, rangeIndex === 0 ? 1 : (ranges[rangeIndex - 1]?.endRound ?? 0) + 1),
      points: Math.max(0, range?.points ?? 0),
    }));
    setLocalConfig({ ...localConfig, scoringRanges: normalizedRanges });
  };

  const addRange = () => {
    const ranges = [...(localConfig?.scoringRanges ?? [])];
    const last = ranges[ranges?.length - 1];
    ranges.push({
      startRound: (last?.endRound ?? 0) + 1,
      endRound: (last?.endRound ?? 0) + 3,
      points: (last?.points ?? 10) + 10,
    });
    setLocalConfig({ ...localConfig, scoringRanges: ranges });
  };

  const removeRange = (index: number) => {
    const ranges = [...(localConfig?.scoringRanges ?? [])];
    ranges?.splice(index, 1);
    setLocalConfig({ ...localConfig, scoringRanges: ranges });
  };

  const enabledHelpsCount = Object.values(localConfig?.helpsEnabled ?? {}).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e: React.MouseEvent) => e?.stopPropagation()}
        className="bg-[var(--quiz-card)] border border-[hsl(var(--border))] rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto scrollbar-none"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-xl text-white">CONFIGURAÇÕES</h3>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Total Rounds */}
          <div>
            <label className="text-sm text-[hsl(var(--muted-foreground))] mb-1 block">Quantidade de rodadas</label>
            <input
              type="number"
              min={1}
              max={20}
              value={localConfig?.totalRounds ?? 8}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalConfig({ ...localConfig, totalRounds: parseInt(e?.target?.value ?? '8') || 8 })}
              className="w-full bg-[var(--quiz-dark)] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--quiz-gold)] transition font-mono text-lg"
            />
          </div>

          <div>
            <label className="text-sm text-[hsl(var(--muted-foreground))] mb-1 block">Pontuação padrão por acerto</label>
            <input type="number" min={0} value={localConfig?.defaultPoints ?? 10} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalConfig({ ...localConfig, defaultPoints: Math.max(0, parseInt(e.target.value, 10) || 0) })} className="w-full bg-[var(--quiz-dark)] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--quiz-gold)] transition font-mono text-lg" />
          </div>

          {/* Scoring Ranges */}
          <div>
            <label className="text-sm text-[hsl(var(--muted-foreground))] mb-2 block">Pontuação por Faixa</label>
            <div className="space-y-2">
              {(localConfig?.scoringRanges ?? [])?.map((range: ScoringRange, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-[hsl(var(--muted-foreground))] w-6">Rod.</span>
                  <input
                    type="number"
                    min={1}
                    value={range?.startRound ?? 1}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRange(i, 'startRound', parseInt(e?.target?.value ?? '1') || 1)}
                    className="w-16 bg-[var(--quiz-dark)] border border-[hsl(var(--border))] rounded-lg px-2 py-2 text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-[var(--quiz-gold)]"
                  />
                  <span className="text-[hsl(var(--muted-foreground))] text-sm">a</span>
                  <input
                    type="number"
                    min={1}
                    value={range?.endRound ?? 3}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRange(i, 'endRound', parseInt(e?.target?.value ?? '3') || 3)}
                    className="w-16 bg-[var(--quiz-dark)] border border-[hsl(var(--border))] rounded-lg px-2 py-2 text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-[var(--quiz-gold)]"
                  />
                  <span className="text-[hsl(var(--muted-foreground))] text-sm">=</span>
                  <input
                    type="number"
                    min={1}
                    value={range?.points ?? 10}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRange(i, 'points', parseInt(e?.target?.value ?? '10') || 10)}
                    className="w-20 bg-[var(--quiz-dark)] border border-[hsl(var(--border))] rounded-lg px-2 py-2 text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-[var(--quiz-gold)]"
                  />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">pts</span>
                  {(localConfig?.scoringRanges?.length ?? 0) > 1 && (
                    <button onClick={() => removeRange(i)} className="text-[var(--quiz-red)] hover:text-red-400 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addRange}
                className="text-xs text-[var(--quiz-gold)] hover:text-yellow-300 flex items-center gap-1 mt-1"
              >
                <Plus className="w-3 h-3" /> Adicionar faixa
              </button>
            </div>
          </div>

          {/* Helps per group */}
          <div>
            <label className="text-sm text-[hsl(var(--muted-foreground))] mb-1 block">Ajudas por Grupo</label>
            <input
              type="number"
              min={0}
              max={enabledHelpsCount}
              value={localConfig?.helpsPerGroup ?? 3}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalConfig({ ...localConfig, helpsPerGroup: Math.min(enabledHelpsCount, Math.max(0, parseInt(e?.target?.value ?? '0', 10) || 0)) })}
              className="w-full bg-[var(--quiz-dark)] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--quiz-gold)] transition font-mono text-lg"
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Máximo atual: {enabledHelpsCount}</p>
          </div>

          <div className={!localConfig?.helpsEnabled?.bibleConsult ? 'opacity-50' : ''}>
            <label className="text-sm text-[hsl(var(--muted-foreground))] mb-1 block">Tempo de Consultar Bíblia (segundos)</label>
            <input type="number" min={1} max={600} disabled={!localConfig?.helpsEnabled?.bibleConsult} value={localConfig?.bibleConsultSeconds ?? 30} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalConfig({ ...localConfig, bibleConsultSeconds: Math.min(600, Math.max(1, parseInt(e.target.value, 10) || 30)) })} className="w-full bg-[var(--quiz-dark)] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--quiz-gold)] transition font-mono text-lg" />
          </div>

          {/* Helps toggles */}
          <div>
            <label className="text-sm text-[hsl(var(--muted-foreground))] mb-2 block">Ajudas Disponíveis</label>
            <div className="space-y-2">
              {Object.entries(HELP_LABELS)?.map(([key, label]: [string, string]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                      (localConfig?.helpsEnabled as any)?.[key] ? 'bg-[var(--quiz-green)]' : 'bg-[hsl(var(--muted))]'
                    }`}
                    onClick={() => {
                      setLocalConfig({
                        ...localConfig,
                        helpsEnabled: {
                          ...localConfig.helpsEnabled,
                          [key]: !(localConfig?.helpsEnabled as any)?.[key],
                        },
                      });
                    }}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        (localConfig?.helpsEnabled as any)?.[key] ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-white text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-[hsl(var(--border))]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] text-white hover:bg-[hsl(var(--secondary))]/80 transition text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[var(--quiz-gold)] text-[var(--quiz-dark)] font-bold px-5 py-2 rounded-lg hover:bg-yellow-400 transition-all disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
