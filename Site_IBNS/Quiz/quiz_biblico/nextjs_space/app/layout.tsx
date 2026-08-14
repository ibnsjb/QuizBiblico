import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';

export const dynamic = 'force-dynamic';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'));

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'VerboQuiz — Quiz Bíblico',
  description: 'Jogo de perguntas e respostas sobre a Bíblia Sagrada no cânon protestante de 66 livros.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  openGraph: {
    title: 'VerboQuiz — Quiz Bíblico',
    description: 'Teste seu conhecimento bíblico, aprenda com referências e dispute o ranking.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} font-sans`}>
        {children}
        <ChunkLoadErrorHandler />
      </body>
    </html>
  );
}
