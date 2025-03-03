'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from './Mascot';

interface GameComponentProps {
  onScoreUpdate: (newScore: number) => void;
  onGameOver: (finalScore: number) => void;
}

const MASCOT_MESSAGES = {
  start: [
    "Klaar voor een ruimte-avontuur?",
    "Laten we samen rekenen!",
    "Tijd om je rekenkunsten te laten zien!"
  ],
  correct: [
    "Wauw, super goed!",
    "Je bent een echte rekenheld!",
    "Fantastisch gedaan!",
    "Zo trots op jou!"
  ],
  incorrect: [
    "Bijna! Probeer nog eens!",
    "Dat geeft niks, volgende keer beter!",
    "Je kunt het, ik geloof in je!"
  ],
  timeUp: [
    "Oeps, de tijd is op!",
    "Laten we het nog een keer proberen!",
    "Volgende som, nieuwe kans!"
  ]
} as const;

const getRandomMessage = (messages: readonly string[]) =>
  messages[Math.floor(Math.random() * messages.length)];

const FloatingSpaceElements = memo(() => (
  <motion.div
    className="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
    initial={false}
  >
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{
          x: Math.random() * 100 - 50 + '%',
          y: Math.random() * 100 - 50 + '%',
          scale: Math.random() * 0.5 + 0.5,
          opacity: 0.3
        }}
        animate={{
          x: Math.random() * 100 - 50 + '%',
          y: Math.random() * 100 - 50 + '%',
          rotate: 360
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {['🌟', '✨', '💫', '🌠', '⭐️'][i]}
      </motion.div>
    ))}
  </motion.div>
));

FloatingSpaceElements.displayName = 'FloatingSpaceElements';

const MAX_ANSWER_LENGTH = 4;
const MIN_ANSWER = -999;
const MAX_ANSWER = 9999;

const sanitizeInput = (input: string): string => {
  // Verwijder niet-numerieke karakters behalve '-'
  return input.replace(/[^\d-]/g, '');
};

const validateAnswer = (answer: string): boolean => {
  const num = parseInt(answer);
  return !isNaN(num) && num >= MIN_ANSWER && num <= MAX_ANSWER;
};

function GameComponent({ onScoreUpdate, onGameOver }: GameComponentProps) {
  console.log('GameComponent gerenderd');

  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(() => {
    console.log('Initieel probleem genereren');
    const problem = {
      num1: Math.floor(Math.random() * 20) + 1,
      num2: Math.floor(Math.random() * 20) + 1,
      operator: '+',
      answer: 0
    };
    console.log('Gegenereerd probleem:', problem);
    return problem;
  });
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);
  const [showLaser, setShowLaser] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [mascotMessage, setMascotMessage] = useState(() => getRandomMessage(MASCOT_MESSAGES.start));

  const generateProblem = useCallback(() => {
    const operators = ['+', '-', 'x'] as const;
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, answer;

    switch (operator) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      case 'x':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 0;
        num2 = 0;
        answer = 0;
    }

    setCurrentProblem({ num1, num2, operator, answer });
    setUserAnswer('');
    setTimeLeft(15);
    setIsCorrect(null);
    setMascotMessage(getRandomMessage(MASCOT_MESSAGES.start));
  }, []);

  useEffect(() => {
    console.log('generateProblem useEffect aangeroepen');
    generateProblem();
  }, [generateProblem]);

  useEffect(() => {
    console.log('Timer useEffect aangeroepen, timeLeft:', timeLeft);
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setMascotMessage(getRandomMessage(MASCOT_MESSAGES.timeUp));
      const timer = setTimeout(() => onGameOver(score), 2000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, score, onGameOver]);

  const audioCache = useMemo(() => ({
    correct: typeof Audio !== 'undefined' ? new Audio('/correct.mp3') : null,
    incorrect: typeof Audio !== 'undefined' ? new Audio('/incorrect.mp3') : null
  }), []);

  const playSound = useCallback((correct: boolean) => {
    const audio = audioCache[correct ? 'correct' : 'incorrect'];
    audio?.play().catch(error => console.log('Audio afspelen mislukt:', error));
  }, [audioCache]);

  const updateScore = useCallback((newScore: number) => {
    setScore(newScore);
    onScoreUpdate(newScore);
  }, [onScoreUpdate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedInput = sanitizeInput(e.target.value);
    if (sanitizedInput.length <= MAX_ANSWER_LENGTH) {
      setUserAnswer(sanitizedInput);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!userAnswer || !validateAnswer(userAnswer)) return;

    const correct = parseInt(userAnswer) === currentProblem.answer;
    setIsCorrect(correct);
    setShowLaser(correct);

    if (correct) {
      updateScore(score + 1);
      playSound(true);
      setMascotMessage(getRandomMessage(MASCOT_MESSAGES.correct));
      const timer = setTimeout(() => {
        setShowLaser(false);
        generateProblem();
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      playSound(false);
      setMascotMessage(getRandomMessage(MASCOT_MESSAGES.incorrect));
      const timer = setTimeout(() => onGameOver(score), 1500);
      return () => clearTimeout(timer);
    }
  }, [userAnswer, currentProblem.answer, score, updateScore, playSound, generateProblem, onGameOver]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer) {
      handleSubmit();
    }
  }, [userAnswer, handleSubmit]);

  return (
    <div className="relative">
      <motion.div
        className="max-w-md mx-auto bg-opacity-80 bg-blue-900 p-8 rounded-lg shadow-xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-4">
          <motion.div
            className="text-2xl font-bold mb-2 p-4 bg-opacity-90 bg-purple-800 rounded-lg"
            animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
          >
            {currentProblem.num1} {currentProblem.operator} {currentProblem.num2} = ?
          </motion.div>
          <div className="text-xl text-yellow-400">
            Tijd over: {timeLeft} seconden
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={userAnswer}
            onChange={handleInputChange}
            className="flex-1 p-2 text-xl text-black rounded"
            placeholder="Jouw antwoord"
            onKeyPress={handleKeyPress}
            maxLength={MAX_ANSWER_LENGTH}
            autoComplete="off"
            autoFocus
            aria-label="Voer je antwoord in"
          />
          <motion.button
            onClick={handleSubmit}
            className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!userAnswer || !validateAnswer(userAnswer)}
            aria-label="Controleer antwoord"
          >
            Check!
          </motion.button>
        </div>

        <AnimatePresence>
          {showLaser && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 0] }}
              exit={{ scale: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-500 opacity-50 rounded-lg"
            />
          )}
        </AnimatePresence>

        <Mascot isHappy={isCorrect !== false} message={mascotMessage} />
        <FloatingSpaceElements />
      </motion.div>
    </div>
  );
}

export default memo(GameComponent);