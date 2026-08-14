import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validatePlayerName } from '@/lib/player-name';

export const dynamic = 'force-dynamic';

const MODES = ['classic', 'sprint', 'survival'] as const;
type Mode = (typeof MODES)[number];
type Row = { id:string; name:string; score:number; mode:Mode; playedAt:Date };

async function ensureTable() {
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "BibleQuizScore" (
    "id" text PRIMARY KEY,
    "name" varchar(20) NOT NULL,
    "nameKey" varchar(64) NOT NULL,
    "score" integer NOT NULL,
    "mode" varchar(20) NOT NULL,
    "correct" integer NOT NULL DEFAULT 0,
    "answered" integer NOT NULL DEFAULT 0,
    "bestStreak" integer NOT NULL DEFAULT 0,
    "playedAt" timestamptz NOT NULL DEFAULT now()
  )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BibleQuizScore_score_idx" ON "BibleQuizScore" ("score" DESC)`);
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT DISTINCT ON ("nameKey") "id", "name", "score", "mode", "playedAt"
      FROM "BibleQuizScore"
      ORDER BY "nameKey", "score" DESC, "playedAt" ASC
    `;
    const ranking = rows.sort((a,b)=>b.score-a.score || +new Date(a.playedAt)-+new Date(b.playedAt)).slice(0,25).map(row=>({...row,playedAt:+new Date(row.playedAt)}));
    return NextResponse.json({ ranking }, { headers:{'Cache-Control':'no-store'} });
  } catch (error) {
    console.error('ranking GET failed', error);
    return NextResponse.json({ ranking:[] }, { headers:{'Cache-Control':'no-store'} });
  }
}

export async function POST(request:Request) {
  try {
    const body=await request.json();
    const validated=validatePlayerName(body?.name);
    if(!validated.ok) return NextResponse.json({error:validated.message},{status:400});
    const mode=body?.mode as Mode;
    const score=Number(body?.score), correct=Number(body?.correct), answered=Number(body?.answered), bestStreak=Number(body?.bestStreak);
    if(!MODES.includes(mode)) return NextResponse.json({error:'Modo inválido.'},{status:400});
    if(![score,correct,answered,bestStreak].every(Number.isFinite)) return NextResponse.json({error:'Resultado inválido.'},{status:400});
    if(score<0||score>25000||correct<0||answered<1||answered>30||correct>answered||bestStreak<0||bestStreak>answered) return NextResponse.json({error:'Resultado fora dos limites permitidos.'},{status:400});
    await ensureTable();
    await prisma.$executeRaw`INSERT INTO "BibleQuizScore" ("id","name","nameKey","score","mode","correct","answered","bestStreak","playedAt") VALUES (${randomUUID()},${validated.name},${validated.key},${Math.round(score)},${mode},${Math.round(correct)},${Math.round(answered)},${Math.round(bestStreak)},now())`;
    return NextResponse.json({ok:true});
  } catch (error) {
    console.error('ranking POST failed', error);
    return NextResponse.json({error:'Não foi possível registrar a pontuação.'},{status:500});
  }
}
