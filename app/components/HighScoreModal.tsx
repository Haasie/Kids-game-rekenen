'use client';

import { motion } from 'framer-motion';

interface HighScoreModalProps {
  score: number;
  onSave: (name: string) => void;
}

export default function HighScoreModal({ score, onSave }: HighScoreModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nameInput = form.elements.namedItem('name') as HTMLInputElement;
    const name = nameInput.value.trim();
    if (name) {
      onSave(name);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-purple-900 rounded-lg p-6 max-w-md w-full text-center"
      >
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">
          Nieuwe Highscore: {score}!
        </h2>
        <p className="text-white mb-6">
          Wauw! Je hebt een nieuwe highscore behaald!
          Vul je naam in om hem op te slaan.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Jouw naam"
            maxLength={20}
            required
            className="w-full p-2 rounded text-black text-lg"
            autoFocus
          />
          <motion.button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded-full text-lg font-bold hover:bg-green-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Opslaan
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}