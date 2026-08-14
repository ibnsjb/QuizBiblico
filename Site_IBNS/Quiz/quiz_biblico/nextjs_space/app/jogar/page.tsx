import type { Metadata } from 'next';
import VerboQuizGame from '@/components/quiz/verbo-quiz-game';

export const metadata: Metadata = {
  title: 'VerboQuiz | Quiz Bíblico IBNS',
  description: 'Jogo de perguntas e respostas sobre a Bíblia Sagrada, com desafios, pontuação e aprendizado a cada rodada.',
};

export default function JogarPage() {
  return <VerboQuizGame />;
}
