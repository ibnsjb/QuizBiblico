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

export default function TechSegArenaPage() {
  return (
    <iframe
      title="TechSeg Arena"
      src="/techseg-arena.html"
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', border: 0, background: '#06101d', zIndex: 9999 }}
      allow="clipboard-write"
    />
  );
}
