import dynamic from 'next/dynamic';

const VerboQuiz = dynamic(() => import('@/components/game/verbo-quiz').then((module) => module.VerboQuiz), { ssr: false });

export default function Home() {
  return <VerboQuiz />;
}
