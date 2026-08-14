'use client';

import {
  ArrowLeft, ArrowRight, BookOpen, Brain, Check, CheckCircle2, ChevronRight,
  CircleHelp, Flame, Gamepad2, Heart, Keyboard, Medal, RotateCcw, Shield,
  Sparkles, Star, Target, Timer, Trophy, Volume2, VolumeX, X, Zap
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VERBO_QUESTIONS, type BibleQuestion, type Category, type Difficulty, type Testament } from '@/lib/verbo-questions';

type Screen = 'home' | 'setup' | 'quiz' | 'result';
type Mode = 'classic' | 'sprint' | 'survival' | 'daily';
type DifficultyFilter = Difficulty | 'Mista';
type TestamentFilter = Testament | 'Toda';
type CategoryFilter = Category | 'Todas';

type Config = { mode: Mode; count: number; difficulty: DifficultyFilter; testament: TestamentFilter; category: CategoryFilter };
type Stats = { games: number; correct: number; answered: number; bestScore: number; bestStreak: number; xp: number; dailyDates: string[] };

const defaultConfig: Config = { mode: 'classic', count: 10, difficulty: 'Mista', testament: 'Toda', category: 'Todas' };
const defaultStats: Stats = { games: 0, correct: 0, answered: 0, bestScore: 0, bestStreak: 0, xp: 0, dailyDates: [] };
const points: Record<Difficulty, number> = { Fácil: 100, Médio: 150, Difícil: 220 };

const modes = {
  classic: { title: 'Clássico', subtitle: 'No seu ritmo, foco total no conhecimento.', icon: BookOpen, tint: 'emerald' },
  sprint: { title: 'Contra o Tempo', subtitle: '60 segundos. Pense rápido. Pontue alto.', icon: Zap, tint: 'amber' },
  survival: { title: 'Sobrevivência', subtitle: 'Três vidas. Até onde você consegue chegar?', icon: Shield, tint: 'rose' },
  daily: { title: 'Desafio Diário', subtitle: 'Sete perguntas selecionadas para hoje.', icon: Sparkles, tint: 'violet' },
} as const;

const tint = {
  emerald: 'from-emerald-400/20 to-emerald-300/5 border-emerald-300/20 text-emerald-200',
  amber: 'from-amber-400/20 to-amber-300/5 border-amber-300/20 text-amber-200',
  rose: 'from-rose-400/20 to-rose-300/5 border-rose-300/20 text-rose-200',
  violet: 'from-violet-400/20 to-violet-300/5 border-violet-300/20 text-violet-200',
};

function shuffle<T>(items: T[], random: () => number = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => ((value = (value * 16807) % 2147483647) - 1) / 2147483646;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function seedFrom(value: string) { return value.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 17); }

function Brand() {
  return <div className="flex items-center gap-3 select-none">
    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-emerald-200/20 bg-emerald-300/10 shadow-[0_0_40px_rgba(52,211,153,.08)]"><BookOpen size={20} strokeWidth={1.8}/></div>
    <div className="text-[19px] font-semibold tracking-[-.03em]">Verbo<span className="text-emerald-300">Quiz</span></div>
  </div>;
}

function IconButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return <button onClick={onClick} aria-label={label} className="grid h-10 w-10 place-items-center rounded-xl border border-white/[.08] bg-white/[.035] text-slate-300 transition hover:border-white/[.16] hover:bg-white/[.07] hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300/50">{children}</button>;
}

export default function VerboQuizGame() {
  const [screen, setScreen] = useState<Screen>('home');
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [sound, setSound] = useState(true);
  const [session, setSession] = useState<BibleQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [seconds, setSeconds] = useState(60);
  const startedAt = useRef(Date.now());
  const today = todayKey();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('verboquiz:stats');
      const savedSound = localStorage.getItem('verboquiz:sound');
      if (saved) setStats({ ...defaultStats, ...JSON.parse(saved) });
      if (savedSound !== null) setSound(savedSound === 'true');
    } catch {}
  }, []);

  useEffect(() => { try { localStorage.setItem('verboquiz:stats', JSON.stringify(stats)); } catch {} }, [stats]);
  useEffect(() => { try { localStorage.setItem('verboquiz:sound', String(sound)); } catch {} }, [sound]);

  const play = useCallback((kind: 'right' | 'wrong' | 'done' | 'tick') => {
    if (!sound) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); const now = ctx.currentTime;
      const freq = kind === 'right' ? [520,760] : kind === 'wrong' ? [220,150] : kind === 'done' ? [440,660] : [330,330];
      osc.type = kind === 'wrong' ? 'sawtooth' : 'sine'; osc.frequency.setValueAtTime(freq[0], now); osc.frequency.exponentialRampToValueAtTime(freq[1], now + .12);
      gain.gain.setValueAtTime(kind === 'tick' ? .018 : .045, now); gain.gain.exponentialRampToValueAtTime(.0001, now + .18);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + .2); setTimeout(() => ctx.close(), 250);
    } catch {}
  }, [sound]);

  const filtered = useMemo(() => VERBO_QUESTIONS.filter(q => {
    if (config.difficulty !== 'Mista' && q.difficulty !== config.difficulty) return false;
    if (config.testament !== 'Toda' && q.testament !== config.testament) return false;
    if (config.category !== 'Todas' && q.category !== config.category) return false;
    return true;
  }), [config]);

  const current = session[index];
  const accuracy = stats.answered ? Math.round(stats.correct / stats.answered * 100) : 0;
  const dailyDone = stats.dailyDates.includes(today);

  const finish = useCallback(() => {
    play('done'); setScreen('result');
    const answeredNow = Math.min(index + 1, session.length);
    setStats(prev => ({
      ...prev,
      games: prev.games + 1,
      correct: prev.correct + correct,
      answered: prev.answered + answeredNow,
      bestScore: Math.max(prev.bestScore, score),
      bestStreak: Math.max(prev.bestStreak, bestStreak),
      xp: prev.xp + Math.max(10, Math.round(score / 10)),
      dailyDates: config.mode === 'daily' && !prev.dailyDates.includes(today) ? [...prev.dailyDates.slice(-29), today] : prev.dailyDates,
    }));
  }, [bestStreak, config.mode, correct, index, play, score, session.length, today]);

  useEffect(() => {
    if (screen !== 'quiz' || config.mode !== 'sprint') return;
    if (seconds <= 0) { finish(); return; }
    const timer = setTimeout(() => { setSeconds(v => v - 1); if (seconds <= 6) play('tick'); }, 1000);
    return () => clearTimeout(timer);
  }, [config.mode, finish, play, screen, seconds]);

  const start = useCallback((next = config) => {
    let pool = VERBO_QUESTIONS.filter(q => {
      if (next.difficulty !== 'Mista' && q.difficulty !== next.difficulty) return false;
      if (next.testament !== 'Toda' && q.testament !== next.testament) return false;
      if (next.category !== 'Todas' && q.category !== next.category) return false;
      return true;
    });
    let count = next.count;
    if (next.mode === 'daily') { pool = shuffle(VERBO_QUESTIONS, seededRandom(seedFrom(today))); count = 7; } else pool = shuffle(pool);
    if (!pool.length) pool = shuffle(VERBO_QUESTIONS);
    setConfig(next); setSession(pool.slice(0, next.mode === 'sprint' ? Math.min(30, pool.length) : Math.min(count, pool.length)));
    setIndex(0); setSelected(null); setLocked(false); setScore(0); setCorrect(0); setStreak(0); setBestStreak(0); setLives(3); setSeconds(60); startedAt.current = Date.now(); setScreen('quiz');
  }, [config, today]);

  const answer = useCallback((choice: number) => {
    if (!current || locked) return;
    setSelected(choice); setLocked(true);
    if (choice === current.answer) {
      const nextStreak = streak + 1;
      const speed = config.mode === 'sprint' ? Math.max(0, Math.round(70 - (Date.now() - startedAt.current) / 500)) : 0;
      setScore(v => v + points[current.difficulty] + Math.min(150, nextStreak * 15) + speed);
      setCorrect(v => v + 1); setStreak(nextStreak); setBestStreak(v => Math.max(v, nextStreak)); play('right');
    } else { setStreak(0); if (config.mode === 'survival') setLives(v => Math.max(0, v - 1)); play('wrong'); }
  }, [config.mode, current, locked, play, streak]);

  const next = useCallback(() => {
    if (!locked || !current) return;
    const lostLife = config.mode === 'survival' && selected !== current.answer;
    if (index >= session.length - 1 || (lostLife && lives - 1 <= 0)) { finish(); return; }
    setIndex(v => v + 1); setSelected(null); setLocked(false); startedAt.current = Date.now();
  }, [config.mode, current, finish, index, lives, locked, selected, session.length]);

  useEffect(() => {
    if (screen !== 'quiz') return;
    const fn = (e: KeyboardEvent) => {
      if (!locked && ['1','2','3','4'].includes(e.key)) answer(Number(e.key) - 1);
      if (locked && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); next(); }
    };
    addEventListener('keydown', fn); return () => removeEventListener('keydown', fn);
  }, [answer, locked, next, screen]);

  const openMode = (mode: Mode) => {
    if (mode === 'daily') start({ ...defaultConfig, mode: 'daily', count: 7 });
    else { setConfig({ ...defaultConfig, mode }); setScreen('setup'); }
  };

  const shell = 'min-h-screen bg-[#07110e] text-slate-100 selection:bg-emerald-300/30';
  const panel = 'rounded-[28px] border border-white/[.08] bg-white/[.035] shadow-[0_24px_80px_rgba(0,0,0,.24)] backdrop-blur-xl';
  const primary = 'inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-3.5 font-semibold text-[#082017] shadow-[0_12px_34px_rgba(52,211,153,.18)] transition hover:-translate-y-0.5 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-[#07110e] disabled:cursor-not-allowed disabled:opacity-40';

  if (screen === 'setup') {
    const meta = modes[config.mode]; const Icon = meta.icon;
    return <main className={shell}>
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-6 sm:px-8">
        <header className="flex items-center justify-between"><IconButton onClick={() => setScreen('home')} label="Voltar"><ArrowLeft size={18}/></IconButton><Brand/><IconButton onClick={() => setSound(v => !v)} label="Alternar som">{sound ? <Volume2 size={18}/> : <VolumeX size={18}/>}</IconButton></header>
        <section className="mx-auto mt-14 max-w-2xl text-center">
          <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl border bg-gradient-to-br ${tint[meta.tint]}`}><Icon size={26}/></div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[.22em] text-emerald-300/80">Configurar partida</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">{meta.title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">{meta.subtitle}</p>
          <div className={`${panel} mt-8 p-5 text-left sm:p-7`}>
            {config.mode !== 'sprint' && <Field title="Quantidade de perguntas"><Segment options={[7,10,15,20]} value={config.count} onChange={v => setConfig(c => ({...c, count: Number(v)}))}/></Field>}
            <Field title="Dificuldade"><Segment options={['Mista','Fácil','Médio','Difícil']} value={config.difficulty} onChange={v => setConfig(c => ({...c, difficulty: v as DifficultyFilter}))}/></Field>
            <Field title="Testamento"><Segment options={['Toda','Antigo','Novo']} labels={{Toda:'Bíblia toda'}} value={config.testament} onChange={v => setConfig(c => ({...c, testament: v as TestamentFilter}))}/></Field>
            <Field title="Categoria">
              <div className="relative"><select value={config.category} onChange={e => setConfig(c => ({...c, category: e.target.value as CategoryFilter}))} className="w-full appearance-none rounded-2xl border border-white/[.08] bg-[#0a1713] px-4 py-3.5 text-sm text-slate-200 outline-none focus:border-emerald-300/40">
                <option value="Todas">Todas as categorias</option>{['Pentateuco','Históricos','Poéticos','Profetas','Evangelhos','Atos','Cartas','Apocalipse'].map(v => <option key={v}>{v}</option>)}
              </select><ChevronRight className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-500" size={17}/></div>
            </Field>
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/[.06] bg-black/10 px-4 py-3 text-xs text-slate-400"><CircleHelp size={15}/><span><strong className="text-slate-200">{filtered.length}</strong> perguntas disponíveis com esses filtros.</span></div>
          </div>
          <button className={`${primary} mt-6 w-full sm:w-auto sm:min-w-64`} onClick={() => start()} disabled={!filtered.length}>Começar desafio <ArrowRight size={18}/></button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500"><Keyboard size={14}/> Use 1–4 para responder e Enter para avançar.</p>
        </section>
      </div>
    </main>;
  }

  if (screen === 'quiz' && current) {
    const meta = modes[config.mode]; const isRight = locked && selected === current.answer; const lostLife = locked && selected !== current.answer;
    return <main className={shell}>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-7">
        <header className="grid grid-cols-[40px_1fr_40px] items-center gap-4"><IconButton onClick={() => setScreen('home')} label="Sair"><X size={18}/></IconButton>
          <div><div className="mb-2 flex justify-between text-[11px] font-medium uppercase tracking-[.14em] text-slate-500"><span>{meta.title}</span><span>{index+1} / {session.length}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200 transition-all duration-500" style={{width:`${((index+(locked?1:0))/session.length)*100}%`}}/></div></div>
          <IconButton onClick={() => setSound(v => !v)} label="Alternar som">{sound ? <Volume2 size={18}/> : <VolumeX size={18}/>}</IconButton></header>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[150px_minmax(0,1fr)_150px]">
          <aside className="hidden space-y-3 lg:block"><Hud icon={<Trophy size={16}/>} label="Pontos" value={score.toLocaleString('pt-BR')}/><Hud icon={<Flame size={16}/>} label="Sequência" value={`${streak}×`}/></aside>
          <section className="mx-auto w-full max-w-3xl">
            <div className="mb-5 flex flex-wrap justify-center gap-2 text-[11px] font-semibold uppercase tracking-[.12em]"><span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-emerald-200">{current.difficulty}</span><span className="rounded-full border border-white/[.07] bg-white/[.03] px-3 py-1.5 text-slate-400">{current.category}</span><span className="rounded-full border border-white/[.07] bg-white/[.03] px-3 py-1.5 text-slate-400">{current.testament} Testamento</span></div>
            <h1 className="mx-auto max-w-3xl text-balance text-center text-3xl font-semibold leading-[1.15] tracking-[-.045em] sm:text-4xl md:text-[44px]">{current.question}</h1>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {current.options.map((opt,i) => {
                const state = locked && i === current.answer ? 'right' : locked && i === selected ? 'wrong' : 'idle';
                const cls = state === 'right' ? 'border-emerald-300/55 bg-emerald-300/[.11] text-emerald-50' : state === 'wrong' ? 'border-rose-300/45 bg-rose-300/[.09] text-rose-50' : 'border-white/[.08] bg-white/[.035] hover:-translate-y-0.5 hover:border-white/[.16] hover:bg-white/[.06]';
                return <button key={opt} disabled={locked} onClick={() => answer(i)} className={`group flex min-h-[82px] items-center gap-4 rounded-[22px] border p-4 text-left transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/40 disabled:cursor-default ${cls}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[.08] bg-black/10 text-xs font-bold text-slate-400">{i+1}</span><span className="flex-1 text-[15px] font-medium leading-5 sm:text-base">{opt}</span><span className="w-5">{state==='right'?<Check size={18}/>:state==='wrong'?<X size={18}/>:null}</span>
                </button>;
              })}
            </div>
            {locked && <div className={`mt-5 rounded-[24px] border p-5 ${isRight?'border-emerald-300/20 bg-emerald-300/[.07]':'border-rose-300/15 bg-rose-300/[.05]'}`}>
              <div className="flex items-center gap-2 text-sm font-semibold">{isRight?<CheckCircle2 className="text-emerald-300" size={18}/>:<CircleHelp className="text-amber-300" size={18}/>}<span>{isRight?'Resposta certa!':'Quase lá.'}</span>{isRight&&<span className="ml-auto text-xs text-emerald-300">+{points[current.difficulty]+Math.min(150,streak*15)} pts</span>}</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{current.explanation}</p><div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[.07] bg-black/10 px-3 py-1.5 text-xs text-slate-400"><BookOpen size={13}/>{current.reference}</div>
            </div>}
            {locked && <button autoFocus className={`${primary} mt-5 w-full`} onClick={next}>{index>=session.length-1 || (config.mode==='survival' && lives-(lostLife?1:0)<=0) ? 'Ver resultado' : 'Próxima pergunta'} <ArrowRight size={18}/></button>}
          </section>
          <aside className="hidden lg:block">{config.mode==='sprint'?<Hud icon={<Timer size={16}/>} label="Tempo" value={`${seconds}s`} danger={seconds<=10}/>:config.mode==='survival'?<div className={`${panel} p-4`}><div className="flex items-center gap-2 text-xs text-slate-500"><Heart size={15}/>Vidas</div><div className="mt-2 flex gap-1 text-rose-300">{[0,1,2].map(v=><Heart key={v} size={18} fill={v<lives?'currentColor':'none'} className={v<lives?'':'opacity-25'}/>)}</div></div>:<Hud icon={<Target size={16}/>} label="Acertos" value={correct}/>}</aside>
        </div>
        <div className="mx-auto mt-6 flex max-w-3xl gap-2 lg:hidden"><div className="flex-1"><Hud icon={<Trophy size={15}/>} label="Pontos" value={score.toLocaleString('pt-BR')}/></div><div className="flex-1">{config.mode==='sprint'?<Hud icon={<Timer size={15}/>} label="Tempo" value={`${seconds}s`} danger={seconds<=10}/>:config.mode==='survival'?<Hud icon={<Heart size={15}/>} label="Vidas" value={lives}/>:<Hud icon={<Flame size={15}/>} label="Sequência" value={`${streak}×`}/>}</div></div>
      </div>
    </main>;
  }

  if (screen === 'result') {
    const answered = Math.min(index + 1, session.length); const pct = answered ? Math.round(correct/answered*100) : 0; const xp = Math.max(10, Math.round(score/10));
    const title = pct>=90?'Excelente domínio!':pct>=70?'Muito bem!':'Continue avançando!';
    return <main className={shell}><div className="mx-auto max-w-3xl px-5 pb-20 pt-6 sm:px-8"><header className="flex items-center justify-between"><Brand/><IconButton onClick={() => setSound(v=>!v)} label="Alternar som">{sound?<Volume2 size={18}/>:<VolumeX size={18}/>}</IconButton></header>
      <section className="mx-auto mt-16 max-w-xl text-center"><div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full border border-amber-200/20 bg-amber-300/10 text-amber-200 shadow-[0_0_80px_rgba(251,191,36,.10)]"><Trophy size={38}/><span className="absolute -right-5 top-0 text-amber-200">✦</span><span className="absolute -left-4 bottom-2 text-emerald-300">✦</span></div><p className="mt-7 text-xs font-semibold uppercase tracking-[.22em] text-emerald-300/80">Partida concluída</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-400">Cada resposta certa reforça o que você já sabe — e cada erro mostra exatamente o que vale revisar.</p>
      <div className={`${panel} mt-8 p-7`}><span className="text-xs uppercase tracking-[.16em] text-slate-500">Pontuação final</span><div className="mt-2 text-5xl font-semibold tracking-[-.05em]">{score.toLocaleString('pt-BR')}</div><div className="mt-2 text-sm font-medium text-emerald-300">+{xp} XP</div><div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/[.07] pt-6"><ResultMetric value={`${correct}/${answered}`} label="Acertos"/><ResultMetric value={`${pct}%`} label="Precisão"/><ResultMetric value={`${bestStreak}×`} label="Sequência"/></div></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2"><button className={primary} onClick={()=>start(config)}><RotateCcw size={17}/> Jogar novamente</button><button onClick={()=>setScreen('home')} className="rounded-2xl border border-white/[.09] bg-white/[.035] px-5 py-3.5 font-semibold text-slate-200 transition hover:bg-white/[.07]">Voltar ao início</button></div></section></div></main>;
  }

  return <main className={shell}>
    <div className="relative overflow-hidden"><div className="pointer-events-none absolute left-1/2 top-[-240px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-emerald-400/[.055] blur-3xl"/><div className="mx-auto max-w-6xl px-5 pb-14 pt-6 sm:px-8">
      <header className="flex items-center justify-between"><Brand/><div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.03] px-3 py-2 text-xs text-slate-400 sm:flex"><Star size={14} className="text-amber-200" fill="currentColor"/>{stats.xp.toLocaleString('pt-BR')} XP</div><IconButton onClick={()=>setSound(v=>!v)} label="Alternar som">{sound?<Volume2 size={18}/>:<VolumeX size={18}/>}</IconButton></div></header>
      <section className="grid min-h-[520px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20"><div><div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[.06] px-3 py-1.5 text-xs font-medium text-emerald-200"><Sparkles size={13}/> Bíblia • Conhecimento • Desafio</div><h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.06em] sm:text-6xl lg:text-[72px]">Quanto da <span className="font-serif italic font-normal text-emerald-200">Palavra</span><br/>você conhece?</h1><p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">Teste seu conhecimento bíblico em desafios rápidos, elegantes e feitos para você aprender enquanto joga.</p><div className="mt-8 flex flex-wrap items-center gap-3"><button className={primary} onClick={()=>openMode('classic')}><Gamepad2 size={18}/> Jogar agora <ArrowRight size={17}/></button><button onClick={()=>openMode('sprint')} className="inline-flex items-center gap-2 px-3 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"><Zap size={16} className="text-amber-200"/> Desafio rápido</button></div></div>
      <div className="relative mx-auto hidden h-[390px] w-full max-w-[470px] lg:block"><div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/[.09]"/><div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/[.06] blur-xl"/><div className="absolute left-1/2 top-1/2 flex h-[250px] w-[330px] -translate-x-1/2 -translate-y-1/2 -rotate-2 overflow-hidden rounded-[28px] border border-amber-100/10 bg-gradient-to-br from-[#17231e] to-[#0a1310] shadow-[0_45px_90px_rgba(0,0,0,.38)]"><div className="flex-1 border-r border-amber-100/10 p-8"><div className="text-3xl text-amber-100/30">✦</div>{[1,2,3,4,5].map(i=><div key={i} className="mt-5 h-px bg-amber-50/10"/>)}</div><div className="flex-1 p-8"><div className="text-3xl text-amber-100/30">†</div>{[1,2,3,4,5].map(i=><div key={i} className="mt-5 h-px bg-amber-50/10"/>)}</div></div><div className="absolute left-0 top-12 flex items-center gap-2 rounded-2xl border border-white/[.08] bg-[#0c1814]/90 px-4 py-3 text-xs text-slate-300 shadow-xl backdrop-blur"><Brain size={16} className="text-emerald-300"/>{VERBO_QUESTIONS.length} perguntas</div><div className="absolute bottom-12 right-0 flex items-center gap-2 rounded-2xl border border-white/[.08] bg-[#0c1814]/90 px-4 py-3 text-xs text-slate-300 shadow-xl backdrop-blur"><Medal size={16} className="text-amber-200"/>3 níveis</div></div></section>
      <section className="grid gap-3 border-y border-white/[.06] py-5 sm:grid-cols-2 lg:grid-cols-4"><Stat icon={<Gamepad2 size={16}/>} value={stats.games} label="Partidas"/><Stat icon={<Target size={16}/>} value={`${accuracy}%`} label="Precisão"/><Stat icon={<Flame size={16}/>} value={`${stats.bestStreak}×`} label="Melhor sequência"/><Stat icon={<Trophy size={16}/>} value={stats.bestScore.toLocaleString('pt-BR')} label="Recorde"/></section>
    </div></div>
    <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8"><div className="mb-6 mt-4"><p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-300/70">Escolha sua experiência</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Modos de jogo</h2></div><div className="grid gap-4 lg:grid-cols-3">{(['classic','sprint','survival'] as Mode[]).map(mode=>{const m=modes[mode];const Icon=m.icon;return <button key={mode} onClick={()=>openMode(mode)} className={`group flex items-center gap-4 rounded-[24px] border bg-gradient-to-br p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-white/[.16] ${tint[m.tint]}`}><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-current/15 bg-black/10"><Icon size={22}/></span><span className="min-w-0 flex-1"><strong className="block text-base text-slate-100">{m.title}</strong><small className="mt-1 block leading-5 text-slate-400">{m.subtitle}</small></span><ChevronRight size={18} className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-white"/></button>})}</div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><button onClick={()=>openMode('daily')} className="group rounded-[28px] border border-violet-300/15 bg-gradient-to-br from-violet-400/[.09] to-white/[.02] p-6 text-left transition hover:-translate-y-1 hover:border-violet-200/25 sm:p-7"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl border border-violet-300/20 bg-violet-300/10 text-violet-200"><Sparkles size={22}/></span><span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${dailyDone?'bg-emerald-300/10 text-emerald-200':'bg-violet-300/10 text-violet-200'}`}>{dailyDone?'✓ Concluído hoje':'Disponível agora'}</span></div><p className="mt-6 text-xs font-semibold uppercase tracking-[.18em] text-violet-200/70">Desafio diário</p><h3 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Sete perguntas.<br/>Uma seleção por dia.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Uma rodada curta e equilibrada para criar constância no seu conhecimento bíblico.</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-100">{dailyDone?'Jogar novamente':'Aceitar desafio'} <ArrowRight size={16} className="transition group-hover:translate-x-1"/></span></button>
      <div className={`${panel} p-6 sm:p-7`}><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-300/70">Sua jornada</p><h3 className="mt-2 text-2xl font-semibold tracking-[-.035em]">Domínio bíblico</h3></div><Trophy size={22} className="text-amber-200/80"/></div><div className="mt-7 space-y-5">{[['Pentateuco',Math.min(100,Math.round(stats.games*7+accuracy*.32))],['Evangelhos',Math.min(100,Math.round(stats.games*9+accuracy*.4))],['Cartas',Math.min(100,Math.round(stats.games*5+accuracy*.28))]].map(([label,value])=><div key={String(label)}><div className="mb-2 flex justify-between text-xs"><span className="text-slate-400">{label}</span><strong>{value}%</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-emerald-300" style={{width:`${value}%`}}/></div></div>)}</div></div></div>
      <footer className="mt-12 flex flex-col gap-2 border-t border-white/[.06] pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex items-center gap-2"><BookOpen size={13}/> Cânon protestante • 66 livros</span><span>VerboQuiz • aprender jogando</span></footer>
    </div>
  </main>;
}

function Field({title,children}:{title:string;children:React.ReactNode}) { return <fieldset className="mb-6 last:mb-0"><legend className="mb-2.5 text-xs font-semibold uppercase tracking-[.13em] text-slate-500">{title}</legend>{children}</fieldset>; }
function Segment({options,value,onChange,labels={}}:{options:(string|number)[];value:string|number;onChange:(v:string|number)=>void;labels?:Record<string,string>}) { return <div className={`grid gap-1 rounded-2xl border border-white/[.07] bg-black/10 p-1 ${options.length===4?'grid-cols-4':'grid-cols-3'}`}>{options.map(v=><button type="button" key={v} onClick={()=>onChange(v)} className={`rounded-xl px-2 py-2.5 text-xs font-medium transition sm:text-sm ${value===v?'bg-white/[.09] text-white shadow-sm':'text-slate-500 hover:text-slate-300'}`}>{labels[String(v)]||v}</button>)}</div>; }
function Hud({icon,label,value,danger=false}:{icon:React.ReactNode;label:string;value:string|number;danger?:boolean}) { return <div className={`rounded-2xl border p-4 ${danger?'border-rose-300/20 bg-rose-300/[.07]':'border-white/[.07] bg-white/[.035]'}`}><div className={`flex items-center gap-2 text-[11px] uppercase tracking-[.12em] ${danger?'text-rose-300':'text-slate-500'}`}>{icon}{label}</div><strong className="mt-2 block text-xl tracking-[-.03em]">{value}</strong></div>; }
function Stat({icon,value,label}:{icon:React.ReactNode;value:string|number;label:string}) { return <div className="flex items-center justify-center gap-3 py-1 sm:justify-start"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.04] text-emerald-300">{icon}</span><div><strong className="block text-base">{value}</strong><span className="text-xs text-slate-500">{label}</span></div></div>; }
function ResultMetric({value,label}:{value:string;label:string}) { return <div><strong className="block text-lg">{value}</strong><span className="mt-1 block text-[11px] uppercase tracking-[.1em] text-slate-500">{label}</span></div>; }
