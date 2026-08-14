'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock3, Flame, Gamepad2, Heart, Medal, Shield, Sparkles, Target, Timer, Trophy, UserRound, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { gameQuestions, type BibleQuestion, type Difficulty, type Testament } from '@/lib/game-questions';
import { validatePlayerName } from '@/lib/player-name';

type Screen = 'home' | 'setup' | 'quiz' | 'result';
type GameMode = 'classic' | 'sprint' | 'survival';
type DifficultyFilter = Difficulty | 'Mista';
type TestamentFilter = Testament | 'Toda';
type RankingEntry = { id?: string; name: string; score: number; mode: GameMode; playedAt: number };
type Stats = { games:number; correct:number; answered:number; bestScore:number; bestStreak:number };

const defaultStats: Stats = { games:0, correct:0, answered:0, bestScore:0, bestStreak:0 };
const points: Record<Difficulty, number> = { 'Fácil':100, 'Médio':160, 'Difícil':240 };
const modes = {
  classic:{ title:'Clássico', subtitle:'10 perguntas, foco total e sem pressão.', icon:BookOpen, tone:'from-emerald-400/20 to-emerald-400/0', border:'hover:border-emerald-400/40' },
  sprint:{ title:'Contra o Tempo', subtitle:'60 segundos para chegar o mais longe possível.', icon:Zap, tone:'from-amber-300/20 to-amber-300/0', border:'hover:border-amber-300/40' },
  survival:{ title:'Sobrevivência', subtitle:'3 vidas. Um erro custa caro.', icon:Shield, tone:'from-rose-400/20 to-rose-400/0', border:'hover:border-rose-400/40' },
} satisfies Record<GameMode, {title:string;subtitle:string;icon:typeof BookOpen;tone:string;border:string}>;

function shuffle<T>(value:T[]) { const a=[...value]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function modeTitle(mode:GameMode){ return modes[mode].title; }

function sound(enabled:boolean, kind:'ok'|'bad'|'done'|'tick'){
  if(!enabled || typeof window==='undefined') return;
  try {
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if(!Ctx) return;
    const ctx=new Ctx(); const osc=ctx.createOscillator(); const gain=ctx.createGain();
    const map={ok:[540,760],bad:[220,150],done:[440,880],tick:[320,320]} as const; const now=ctx.currentTime;
    osc.type=kind==='bad'?'sawtooth':'sine'; osc.frequency.setValueAtTime(map[kind][0],now); osc.frequency.exponentialRampToValueAtTime(map[kind][1],now+.12);
    gain.gain.setValueAtTime(kind==='tick'?.02:.045,now); gain.gain.exponentialRampToValueAtTime(.0001,now+.18); osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(now+.2); setTimeout(()=>void ctx.close(),300);
  } catch {}
}

function Logo(){
  return <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-amber-300/25 bg-amber-300/10 text-amber-200"><BookOpen size={20}/></span><div className="leading-none"><div className="text-lg font-extrabold tracking-tight text-white">Verbo<span className="text-amber-300">Quiz</span></div><div className="mt-1 text-[9px] font-bold uppercase tracking-[.2em] text-slate-500">Bíblia Sagrada</div></div></div>;
}

export function VerboQuiz(){
  const [screen,setScreen]=useState<Screen>('home');
  const [mode,setMode]=useState<GameMode>('classic');
  const [difficulty,setDifficulty]=useState<DifficultyFilter>('Mista');
  const [testament,setTestament]=useState<TestamentFilter>('Toda');
  const [player,setPlayer]=useState(''); const [draft,setDraft]=useState(''); const [nameOpen,setNameOpen]=useState(false); const [nameError,setNameError]=useState('');
  const [ranking,setRanking]=useState<RankingEntry[]>([]); const [stats,setStats]=useState<Stats>(defaultStats); const [soundOn,setSoundOn]=useState(true);
  const [session,setSession]=useState<BibleQuestion[]>([]); const [index,setIndex]=useState(0); const [selected,setSelected]=useState<number|null>(null); const [locked,setLocked]=useState(false);
  const [score,setScore]=useState(0); const [correct,setCorrect]=useState(0); const [streak,setStreak]=useState(0); const [bestStreak,setBestStreak]=useState(0); const [lives,setLives]=useState(3); const [timeLeft,setTimeLeft]=useState(60);
  const questionStarted=useRef(Date.now()); const finishing=useRef(false);

  const refreshRanking=useCallback(async()=>{ try{ const r=await fetch('/api/game-ranking',{cache:'no-store'}); if(!r.ok)return; const d=await r.json(); if(Array.isArray(d?.ranking))setRanking(d.ranking); }catch{} },[]);

  useEffect(()=>{ try{ const p=localStorage.getItem('verboquiz:player'); const st=localStorage.getItem('verboquiz:stats'); const so=localStorage.getItem('verboquiz:sound'); if(p&&validatePlayerName(p).ok){setPlayer(p);setDraft(p)}else setNameOpen(true); if(st)setStats({...defaultStats,...JSON.parse(st)}); if(so!==null)setSoundOn(so==='true'); }catch{setNameOpen(true)} void refreshRanking(); },[refreshRanking]);
  useEffect(()=>{ try{localStorage.setItem('verboquiz:stats',JSON.stringify(stats))}catch{} },[stats]);
  useEffect(()=>{ try{localStorage.setItem('verboquiz:sound',String(soundOn))}catch{} },[soundOn]);

  const current=session[index];
  const answered = index + (locked?1:0);
  const accuracy=stats.answered?Math.round(stats.correct/stats.answered*100):0;

  const finishGame=useCallback(()=>{
    if(finishing.current)return; finishing.current=true; sound(soundOn,'done'); setScreen('result');
    const answeredNow=Math.max(1,index+(locked?1:0));
    setStats(prev=>({games:prev.games+1,correct:prev.correct+correct,answered:prev.answered+answeredNow,bestScore:Math.max(prev.bestScore,score),bestStreak:Math.max(prev.bestStreak,bestStreak)}));
    const valid=validatePlayerName(player);
    if(valid.ok){ void fetch('/api/game-ranking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:valid.name,score,mode,correct,answered:answeredNow,bestStreak})}).then(()=>refreshRanking()).catch(()=>undefined); }
  },[bestStreak,correct,index,locked,mode,player,refreshRanking,score,soundOn]);

  useEffect(()=>{ if(screen!=='quiz'||mode!=='sprint')return; if(timeLeft<=0){finishGame();return;} const t=setTimeout(()=>{setTimeLeft(v=>v-1);if(timeLeft<=6)sound(soundOn,'tick')},1000); return()=>clearTimeout(t); },[finishGame,mode,screen,soundOn,timeLeft]);

  const startGame=useCallback(()=>{
    if(!validatePlayerName(player).ok){setNameOpen(true);return;}
    let pool=gameQuestions.filter(q=>(difficulty==='Mista'||q.difficulty===difficulty)&&(testament==='Toda'||q.testament===testament)); if(pool.length<5)pool=gameQuestions;
    const count=mode==='sprint'?Math.min(30,pool.length):mode==='classic'?Math.min(10,pool.length):Math.min(20,pool.length);
    setSession(shuffle(pool).slice(0,count)); setIndex(0);setSelected(null);setLocked(false);setScore(0);setCorrect(0);setStreak(0);setBestStreak(0);setLives(3);setTimeLeft(60);finishing.current=false;questionStarted.current=Date.now();setScreen('quiz');
  },[difficulty,mode,player,testament]);

  const answer=useCallback((choice:number)=>{
    if(!current||locked)return; setSelected(choice);setLocked(true); const ok=choice===current.answer;
    if(ok){const next=streak+1;const speed=mode==='sprint'?Math.max(0,Math.round(60-(Date.now()-questionStarted.current)/80)):0;setScore(v=>v+points[current.difficulty]+Math.min(150,next*15)+speed);setCorrect(v=>v+1);setStreak(next);setBestStreak(v=>Math.max(v,next));sound(soundOn,'ok');}
    else{setStreak(0);if(mode==='survival')setLives(v=>Math.max(0,v-1));sound(soundOn,'bad');}
  },[current,locked,mode,soundOn,streak]);

  const next=useCallback(()=>{ if(!locked)return; const lostLife=mode==='survival'&&selected!==current?.answer; const nextLives=lostLife?lives-1:lives; if(index>=session.length-1||(mode==='survival'&&nextLives<=0)){finishGame();return;} setIndex(v=>v+1);setSelected(null);setLocked(false);questionStarted.current=Date.now(); },[current?.answer,finishGame,index,lives,locked,mode,selected,session.length]);

  useEffect(()=>{ if(screen!=='quiz')return; const onKey=(e:KeyboardEvent)=>{if(['1','2','3','4'].includes(e.key)&&!locked)answer(Number(e.key)-1);else if((e.key==='Enter'||e.key===' ')&&locked){e.preventDefault();next();}}; window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey); },[answer,locked,next,screen]);

  const openMode=(m:GameMode)=>{if(!validatePlayerName(player).ok){setNameOpen(true);return;}setMode(m);setDifficulty('Mista');setTestament('Toda');setScreen('setup')};
  const saveName=()=>{const v=validatePlayerName(draft);if(!v.ok){setNameError(v.message);return;}setPlayer(v.name);setDraft(v.name);setNameError('');setNameOpen(false);try{localStorage.setItem('verboquiz:player',v.name)}catch{}};

  const shell='min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(25,70,90,.38),transparent_30%),linear-gradient(145deg,#07101d,#081423_55%,#09111e)] text-slate-100';
  const header=<header className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5"><button onClick={()=>setScreen('home')} aria-label="Início"><Logo/></button><div className="flex items-center gap-2"><button onClick={()=>setSoundOn(v=>!v)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.03] text-slate-400 hover:text-amber-200">{soundOn?<Volume2 size={18}/>:<VolumeX size={18}/>}</button><button onClick={()=>{setDraft(player);setNameOpen(true)}} className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-3 text-sm font-bold text-slate-200"><span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-300 text-slate-950"><UserRound size={15}/></span><span className="hidden sm:inline">{player||'Jogador'}</span></button></div></header>;

  if(screen==='quiz'&&current){
    const isCorrect=locked&&selected===current.answer; const progress=Math.round(((index+(locked?1:0))/session.length)*100);
    return <main className={shell}>{header}<div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-5">
      <div className="mb-4 grid grid-cols-[auto_1fr_auto] items-center gap-4 text-xs"><span className="font-bold text-slate-400">{index+1}/{session.length}</span><div className="h-1.5 overflow-hidden rounded-full bg-white/5"><motion.div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-200" animate={{width:`${progress}%`}}/></div><span className="font-black text-amber-200">{score.toLocaleString('pt-BR')} pts</span></div>
      <div className="grid gap-4 lg:grid-cols-[150px_1fr_150px]">
        <aside className="hidden space-y-3 lg:block"><Hud icon={<Trophy size={17}/>} label="Pontos" value={score.toLocaleString('pt-BR')}/><Hud icon={<Flame size={17}/>} label="Sequência" value={`${streak}×`}/></aside>
        <motion.section key={current.id} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} className="rounded-[28px] border border-white/10 bg-slate-900/65 p-5 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex flex-wrap gap-2 text-[10px] font-extrabold uppercase tracking-[.14em]"><span className="rounded-lg border border-amber-300/20 bg-amber-300/5 px-2.5 py-1.5 text-amber-200">{current.difficulty}</span><span className="rounded-lg border border-sky-300/15 bg-sky-300/5 px-2.5 py-1.5 text-sky-200">{current.category}</span><span className="rounded-lg border border-white/10 px-2.5 py-1.5 text-slate-400">{current.testament} Testamento</span></div>
          <h1 className="mb-8 text-2xl font-black leading-tight tracking-[-.03em] text-white sm:text-4xl">{current.question}</h1>
          <div className="grid gap-3 sm:grid-cols-2">{current.options.map((option,i)=>{const good=locked&&i===current.answer;const bad=locked&&i===selected&&!good;return <button key={option} disabled={locked} onClick={()=>answer(i)} className={`flex min-h-20 items-center gap-3 rounded-2xl border p-4 text-left transition ${good?'border-emerald-400/50 bg-emerald-400/10':bad?'border-rose-400/50 bg-rose-400/10':'border-white/10 bg-white/[.025] hover:-translate-y-0.5 hover:border-amber-300/30 hover:bg-amber-300/[.04]'}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-xs font-black ${good?'border-emerald-400/30 text-emerald-300':bad?'border-rose-400/30 text-rose-300':'border-white/10 text-slate-500'}`}>{i+1}</span><span className="font-semibold text-slate-100">{option}</span><span className="ml-auto">{good?<Check size={18} className="text-emerald-300"/>:bad?<X size={18} className="text-rose-300"/>:null}</span></button>})}</div>
          <AnimatePresence>{locked&&<motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`mt-6 rounded-2xl border p-4 ${isCorrect?'border-emerald-400/20 bg-emerald-400/[.06]':'border-rose-400/20 bg-rose-400/[.05]'}`}><div className="flex items-center gap-2 font-black">{isCorrect?<CheckCircle2 size={19} className="text-emerald-300"/>:<Target size={19} className="text-rose-300"/>}{isCorrect?'Resposta certa!':'Quase lá.'}</div><p className="mt-2 text-sm leading-6 text-slate-400">{current.explanation}</p><p className="mt-2 flex items-center gap-2 text-xs font-bold text-amber-200"><BookOpen size={14}/>{current.reference}</p></motion.div>}</AnimatePresence>
          {locked&&<button autoFocus onClick={next} className="ml-auto mt-5 flex h-12 items-center gap-3 rounded-xl bg-gradient-to-r from-amber-300 to-amber-200 px-5 font-black text-slate-950 shadow-lg shadow-amber-300/10">{index>=session.length-1||(mode==='survival'&&lives-(selected!==current.answer?1:0)<=0)?'Ver resultado':'Próxima pergunta'}<ArrowRight size={18}/></button>}
        </motion.section>
        <aside className="hidden lg:block">{mode==='sprint'?<Hud icon={<Timer size={17}/>} label="Tempo" value={`${timeLeft}s`} danger={timeLeft<=10}/>:mode==='survival'?<div className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vidas</span><div className="mt-3 flex gap-1 text-rose-300">{[0,1,2].map(i=><Heart key={i} size={19} fill={i<lives?'currentColor':'none'} className={i<lives?'':'opacity-25'}/>)}</div></div>:<Hud icon={<Target size={17}/>} label="Acertos" value={String(correct)}/>}</aside>
      </div>
      <div className="mt-4 flex items-center justify-center gap-5 text-xs text-slate-600 lg:hidden"><span>{modeTitle(mode)}</span><span>•</span><span>{mode==='sprint'?`${timeLeft}s`:mode==='survival'?`${lives} vidas`:`${streak}× sequência`}</span></div>
    </div></main>;
  }

  if(screen==='setup'){
    const M=modes[mode]; const Icon=M.icon;
    return <main className={shell}>{header}<section className="mx-auto max-w-2xl px-5 pb-16 pt-10"><button onClick={()=>setScreen('home')} className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white"><ArrowLeft size={17}/>Voltar</button><div className="rounded-[30px] border border-white/10 bg-slate-900/65 p-6 shadow-2xl backdrop-blur-xl sm:p-9"><div className="mb-7 flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200"><Icon size={26}/></span><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-amber-300">Configurar partida</p><h1 className="mt-1 text-3xl font-black tracking-tight">{M.title}</h1><p className="mt-1 text-sm text-slate-500">{M.subtitle}</p></div></div>
      <Choice title="Dificuldade" value={difficulty} values={['Mista','Fácil','Médio','Difícil']} onChange={v=>setDifficulty(v as DifficultyFilter)}/><Choice title="Testamento" value={testament} values={['Toda','Antigo','Novo']} onChange={v=>setTestament(v as TestamentFilter)}/>
      <button onClick={startGame} className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-300 to-amber-200 font-black text-slate-950 shadow-xl shadow-amber-300/10">Começar desafio<ArrowRight size={19}/></button></div></section></main>;
  }

  if(screen==='result'){
    const answeredNow=Math.max(1,answered);const pct=Math.round(correct/answeredNow*100);
    return <main className={shell}>{header}<section className="mx-auto max-w-2xl px-5 pb-20 pt-12 text-center"><motion.div initial={{scale:.7,opacity:0}} animate={{scale:1,opacity:1}} className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-amber-300/25 bg-amber-300/[.07] text-amber-200 shadow-[0_0_60px_rgba(251,191,36,.12)]"><Trophy size={42}/></motion.div><p className="mt-8 text-[10px] font-extrabold uppercase tracking-[.2em] text-amber-300">Partida concluída</p><h1 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-6xl">{pct>=90?'Excelente domínio!':pct>=70?'Muito bem!':'Continue avançando!'}</h1><p className="mx-auto mt-4 max-w-lg text-slate-500">{pct>=80?'Seu conhecimento bíblico foi consistente nesta rodada.':'Use as referências exibidas para revisar e volte para superar sua marca.'}</p><div className="my-9"><span className="text-xs font-bold uppercase tracking-[.18em] text-slate-600">Pontuação final</span><div className="mt-1 text-7xl font-black tracking-[-.06em] text-amber-200">{score.toLocaleString('pt-BR')}</div></div><div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[.025] p-5"><Result value={`${correct}/${answeredNow}`} label="Acertos"/><Result value={`${pct}%`} label="Precisão"/><Result value={`${bestStreak}×`} label="Sequência"/></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={startGame} className="flex h-13 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 font-black text-slate-950"><Gamepad2 size={18}/>Jogar novamente</button><button onClick={()=>setScreen('home')} className="h-13 rounded-xl border border-white/10 bg-white/[.03] px-5 font-bold text-white">Voltar ao início</button></div></section></main>;
  }

  return <main className={shell}>{header}<section className="mx-auto grid max-w-6xl gap-7 px-5 pb-8 pt-10 lg:grid-cols-[1.25fr_.75fr] lg:pt-16"><motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="rounded-[32px] border border-white/10 bg-slate-900/55 p-7 shadow-2xl backdrop-blur-xl sm:p-11"><div className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/[.05] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-amber-200"><Sparkles size={13}/>Conhecimento que vira desafio</div><h1 className="mt-6 text-5xl font-black leading-[.96] tracking-[-.055em] sm:text-7xl">Quanto da <span className="font-medium text-amber-200">Palavra</span><br/>você conhece?</h1><p className="mt-6 max-w-xl text-base leading-7 text-slate-400">Perguntas bíblicas com referências, feedback imediato e um ranking para transformar conhecimento em uma experiência divertida.</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={()=>openMode('classic')} className="flex h-13 items-center gap-3 rounded-xl bg-gradient-to-r from-amber-300 to-amber-200 px-6 font-black text-slate-950 shadow-xl shadow-amber-300/10">Jogar agora<ArrowRight size={18}/></button><button onClick={()=>openMode('sprint')} className="flex h-13 items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-5 font-bold text-white"><Zap size={17}/>Desafio rápido</button></div><div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-7"><Tiny value={String(gameQuestions.length)} label="Perguntas"/><Tiny value="3" label="Modos"/><Tiny value="66" label="Livros"/></div></motion.div>
    <div className="grid gap-4">{(['classic','sprint','survival'] as GameMode[]).map(m=>{const M=modes[m];const Icon=M.icon;return <button key={m} onClick={()=>openMode(m)} className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${M.tone} p-5 text-left transition hover:-translate-y-1 ${M.border}`}><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-amber-200"><Icon size={21}/></span><ArrowRight size={18} className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-amber-200"/></div><h2 className="mt-5 text-xl font-black">{M.title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{M.subtitle}</p></button>})}</div></section>
    <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-16 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-2xl border border-white/10 bg-white/[.025] p-6"><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-amber-300">Seu progresso</p><div className="mt-5 grid grid-cols-2 gap-3"><Mini value={stats.games} label="Partidas"/><Mini value={`${accuracy}%`} label="Precisão"/><Mini value={`${stats.bestStreak}×`} label="Sequência"/><Mini value={stats.bestScore.toLocaleString('pt-BR')} label="Recorde"/></div></div><div className="rounded-2xl border border-white/10 bg-white/[.025] p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-amber-300">Pontuação</p><h2 className="mt-1 text-2xl font-black">Ranking global</h2></div><Medal className="text-amber-200"/></div><div className="mt-5 space-y-2">{ranking.length?ranking.slice(0,5).map((r,i)=><div key={`${r.name}-${r.playedAt}-${i}`} className={`grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-xl border p-3 ${r.name===player?'border-amber-300/20 bg-amber-300/[.05]':'border-white/[.06] bg-black/10'}`}><span className="text-center text-xs font-black text-slate-500">{i+1}</span><span className="min-w-0"><strong className="block truncate text-sm">{r.name}</strong><small className="text-[10px] text-slate-600">{modeTitle(r.mode)}</small></span><strong className="text-sm text-amber-200">{r.score.toLocaleString('pt-BR')}</strong></div>):<div className="rounded-xl border border-dashed border-white/10 p-7 text-center text-sm text-slate-600">O ranking será inaugurado pela primeira pontuação.</div>}</div><p className="mt-3 text-[10px] text-slate-600">Sem cadastro. Nomes são filtrados e revalidados no servidor.</p></div></section>
    <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/[.06] px-5 py-7 text-[11px] text-slate-600 sm:flex-row"><span className="flex items-center gap-2"><BookOpen size={14}/>Cânon protestante de 66 livros</span><a className="font-bold hover:text-amber-200" href="/placar">Placar para eventos →</a></footer>
    <NameModal open={nameOpen} player={player} draft={draft} error={nameError} setDraft={(v)=>{setDraft(v.slice(0,20));setNameError('')}} close={()=>player&&setNameOpen(false)} save={saveName}/>
  </main>;
}

function Hud({icon,label,value,danger=false}:{icon:React.ReactNode;label:string;value:string;danger?:boolean}){return <div className={`rounded-2xl border p-4 ${danger?'border-rose-400/30 bg-rose-400/[.06]':'border-white/10 bg-white/[.025]'}`}><div className={danger?'text-rose-300':'text-amber-200'}>{icon}</div><div className="mt-3 text-[9px] font-bold uppercase tracking-widest text-slate-600">{label}</div><strong className={`mt-1 block text-xl ${danger?'text-rose-300':'text-white'}`}>{value}</strong></div>}
function Choice({title,value,values,onChange}:{title:string;value:string;values:string[];onChange:(v:string)=>void}){return <div className="mt-6"><p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-slate-500">{title}</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{values.map(v=><button key={v} onClick={()=>onChange(v)} className={`h-11 rounded-xl border text-sm font-bold transition ${value===v?'border-amber-300/30 bg-amber-300/10 text-amber-200':'border-white/10 bg-white/[.025] text-slate-400 hover:text-white'}`}>{v}</button>)}</div></div>}
function Result({value,label}:{value:string;label:string}){return <div><strong className="block text-xl text-white">{value}</strong><span className="mt-1 block text-[9px] font-bold uppercase tracking-widest text-slate-600">{label}</span></div>}
function Tiny({value,label}:{value:string;label:string}){return <div><strong className="block text-xl text-white">{value}</strong><span className="mt-1 block text-[9px] font-bold uppercase tracking-widest text-slate-600">{label}</span></div>}
function Mini({value,label}:{value:string|number;label:string}){return <div className="rounded-xl border border-white/[.06] bg-black/10 p-3"><strong className="block text-lg text-white">{value}</strong><span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{label}</span></div>}
function NameModal({open,player,draft,error,setDraft,close,save}:{open:boolean;player:string;draft:string;error:string;setDraft:(v:string)=>void;close:()=>void;save:()=>void}){return <AnimatePresence>{open&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-md"><motion.form initial={{scale:.96,y:12}} animate={{scale:1,y:0}} exit={{scale:.97,opacity:0}} onSubmit={e=>{e.preventDefault();save()}} className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#0d1828] p-7 shadow-2xl">{player&&<button type="button" onClick={close} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-500 hover:text-white"><X size={17}/></button>}<span className="grid h-14 w-14 place-items-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200"><UserRound size={24}/></span><p className="mt-6 text-[10px] font-extrabold uppercase tracking-[.18em] text-amber-300">Sem cadastro</p><h2 className="mt-2 text-3xl font-black tracking-tight">Seu nome no ranking</h2><p className="mt-2 text-sm leading-6 text-slate-500">Informe apenas um nome ou apelido. Não pedimos e-mail nem senha.</p><label className="mt-6 block text-[10px] font-bold uppercase tracking-widest text-slate-500" htmlFor="player-name">Nome do jogador</label><div className="mt-2 flex items-center rounded-xl border border-white/10 bg-black/15 px-3 focus-within:border-amber-300/30"><input id="player-name" autoFocus autoComplete="nickname" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={20} placeholder="Ex.: Kinho" className="h-12 min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-700"/><span className="text-[10px] text-slate-700">{draft.length}/20</span></div><p className="min-h-6 pt-1 text-xs text-rose-300">{error}</p><button type="submit" className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-200 font-black text-slate-950">Continuar<ArrowRight size={18}/></button><p className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-600"><Shield size={13}/>Palavras ofensivas e tentativas de camuflagem são bloqueadas.</p></motion.form></motion.div>}</AnimatePresence>}
