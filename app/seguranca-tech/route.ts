import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SOURCE = 'https://raw.githubusercontent.com/ibnsjb/QuizBiblico/main/public/seguranca-tech/index.html';

export async function GET() {
  const response = await fetch(SOURCE, { cache: 'no-store' });

  if (!response.ok) {
    return new NextResponse('TechSeg Arena indisponível.', { status: 503 });
  }

  const html = await response.text();
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });
}
