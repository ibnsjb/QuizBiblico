export const metadata = {
  title: 'TechSeg Arena — Tecnologia na Segurança Pública',
  description: 'Quiz competitivo em tempo real com placar, velocidade e auditoria de respostas.',
  openGraph: {
    title: 'TechSeg Arena — Tecnologia na Segurança Pública',
    description: 'Quiz competitivo em tempo real com placar, velocidade e auditoria de respostas.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'TechSeg Arena — Tecnologia na Segurança Pública',
    description: 'Quiz competitivo em tempo real com placar, velocidade e auditoria de respostas.',
  },
};

const SOURCE = 'https://raw.githubusercontent.com/ibnsjb/QuizBiblico/main/public/seguranca-tech/index.html';

export const dynamic = 'force-dynamic';

export default async function TechSegArenaPage() {
  const response = await fetch(SOURCE, { cache: 'no-store' });
  const html = response.ok
    ? await response.text()
    : '<!doctype html><html><body style="background:#06101d;color:white;font-family:system-ui;padding:40px"><h1>TechSeg Arena</h1><p>Não foi possível carregar a aplicação neste momento.</p></body></html>';

  return (
    <iframe
      title="TechSeg Arena"
      srcDoc={html}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', border: 0, background: '#06101d', zIndex: 9999 }}
      allow="clipboard-write"
    />
  );
}
