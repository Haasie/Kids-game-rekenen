'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import HighScoreModal from './components/HighScoreModal';
import { motion } from 'framer-motion';

const GameComponent = dynamic(() => import('./components/GameComponent'), { ssr: false });

interface HighScore {
  name: string;
  score: number;
  date: string;
}

interface ScoreData {
  scores: HighScore[];
  lastReset: string;
}

export default function Home() {
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [showHighScoreModal, setShowHighScoreModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [nextReset, setNextReset] = useState<string>('');

  useEffect(() => {
    // Laad de highscores van de server
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await fetch('/api/scores');
      const data: ScoreData = await response.json();
      setHighScores(data.scores);

      // Bereken wanneer de volgende reset is
      const lastReset = new Date(data.lastReset);
      const nextResetDate = new Date(lastReset.getTime() + 7 * 24 * 60 * 60 * 1000);
      setNextReset(nextResetDate.toLocaleDateString('nl-NL'));
    } catch (error) {
      console.error('Fout bij ophalen scores:', error);
    }
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };

  const handleGameOver = (finalScore: number) => {
    setFinalScore(finalScore);
    setGameStarted(false);

    // Check of dit een nieuwe highscore is
    const lowestHighScore = highScores.length >= 5 ?
      Math.min(...highScores.map(hs => hs.score)) : 0;

    if (finalScore > lowestHighScore || highScores.length < 5) {
      setShowHighScoreModal(true);
    }
  };

  const handleHighScoreSave = async (name: string) => {
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          score: finalScore,
        }),
      });

      const data: ScoreData = await response.json();
      setHighScores(data.scores);
      setShowHighScoreModal(false);
    } catch (error) {
      console.error('Fout bij opslaan score:', error);
      alert('Er ging iets mis bij het opslaan van je score. Probeer het nog eens!');
    }
  };

  const handleStartGame = () => {
    setScore(0);
    setGameStarted(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white">
      <div className="stars absolute inset-0" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
          Ruimte Rekenen!
        </h1>

        <div className="text-center mb-8">
          {!gameStarted && finalScore > 0 && (
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-yellow-400 mb-4"
            >
              Game Over! Je score: {finalScore}
            </motion.p>
          )}

          {gameStarted && (
            <p className="text-xl mb-4">Huidige Score: {score}</p>
          )}

          {/* Highscores tabel */}
          <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4 max-w-md mx-auto mb-8">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Top 5 Highscores</h2>
            <p className="text-sm text-gray-300 mb-4">
              Volgende reset: {nextReset}
            </p>
            {highScores.length > 0 ? (
              <div className="space-y-2">
                {highScores.map((hs, index) => (
                  <div key={index} className="flex justify-between items-center bg-purple-700 bg-opacity-50 rounded p-2">
                    <span className="font-bold">{index + 1}. {hs.name}</span>
                    <div className="text-right">
                      <span className="text-yellow-400">{hs.score}</span>
                      <span className="text-sm text-gray-300 ml-2">({hs.date})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-300">Nog geen highscores deze week!</p>
            )}
          </div>
        </div>

        {!gameStarted ? (
          <div className="text-center">
            <button
              onClick={handleStartGame}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-pink-600 hover:to-purple-600 transform hover:scale-105 transition-all"
            >
              {finalScore > 0 ? 'Speel nog een keer!' : 'Start het Avontuur!'}
            </button>
          </div>
        ) : (
          <GameComponent
            onScoreUpdate={handleScoreUpdate}
            onGameOver={handleGameOver}
          />
        )}
      </div>

      {showHighScoreModal && (
        <HighScoreModal
          score={finalScore}
          onSave={handleHighScoreSave}
        />
      )}
    </main>
  );
}