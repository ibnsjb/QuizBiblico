import dynamic from 'next/dynamic';

const HomeClient = dynamic(() => import('@/components/quiz/home-client'), { ssr: false });

export default function EventScoreboardPage() {
  return <HomeClient />;
}
