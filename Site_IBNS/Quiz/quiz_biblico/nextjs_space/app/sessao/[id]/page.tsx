import dynamic from 'next/dynamic';

const SessionClient = dynamic(() => import('@/components/quiz/session-client'), { ssr: false });

export default function SessionPage({ params }: { params: { id: string } }) {
  return <SessionClient sessionId={params?.id ?? ''} />;
}
