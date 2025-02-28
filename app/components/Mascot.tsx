'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MascotProps {
  isHappy: boolean;
  message: string;
}

const Mascot = memo(function Mascot({ isHappy, message }: MascotProps) {
  return (
    <div className="relative">
      <motion.div
        className="absolute bottom-0 right-0 transform translate-y-1/2"
        animate={{
          y: [0, -10, 0],
          rotate: isHappy ? [0, 5, -5, 0] : 0
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 0.5,
            repeat: isHappy ? 1 : 0
          }
        }}
      >
        <div className="text-6xl transform -scale-x-100">
          {isHappy ? '🚀' : '🛸'}
        </div>
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white text-purple-900 p-4 rounded-lg shadow-lg max-w-xs ml-auto mb-4 relative"
        >
          <div className="absolute right-0 bottom-0 transform translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-white" />
          {message}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

Mascot.displayName = 'Mascot';

export default Mascot;