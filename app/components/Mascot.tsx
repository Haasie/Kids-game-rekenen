'use client';

import { motion } from 'framer-motion';

interface MascotProps {
  isHappy: boolean;
  message?: string;
}

export default function Mascot({ isHappy, message }: MascotProps) {
  return (
    <motion.div
      className="absolute -top-32 md:top-auto md:bottom-4 right-4 z-50"
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="relative">
        {/* Ruimtewezen gezicht */}
        <div className="w-20 h-20 md:w-32 md:h-32 bg-purple-500 rounded-full relative overflow-hidden border-4 border-purple-600">
          {/* Ogen */}
          <motion.div
            className="absolute left-3 md:left-4 top-6 md:top-8 w-4 md:w-6 h-4 md:h-6 bg-white rounded-full"
            animate={{ scale: isHappy ? 1.2 : 0.8 }}
          >
            <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-black rounded-full absolute top-1.5 md:top-2 right-0.5 md:right-1" />
          </motion.div>
          <motion.div
            className="absolute right-3 md:right-4 top-6 md:top-8 w-4 md:w-6 h-4 md:h-6 bg-white rounded-full"
            animate={{ scale: isHappy ? 1.2 : 0.8 }}
          >
            <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-black rounded-full absolute top-1.5 md:top-2 right-0.5 md:right-1" />
          </motion.div>

          {/* Mond */}
          <motion.div
            className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 bg-white"
            animate={{
              width: isHappy ? "20px" : "12px",
              height: isHappy ? "12px" : "6px",
              borderRadius: isHappy ? "10px 10px 20px 20px" : "10px"
            }}
          />

          {/* Antennes */}
          <motion.div
            className="absolute -top-3 md:-top-4 left-1/3 w-1.5 md:w-2 h-4 md:h-6 bg-purple-400"
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 md:w-3 h-2 md:h-3 bg-pink-400 rounded-full absolute -top-1" />
          </motion.div>
          <motion.div
            className="absolute -top-3 md:-top-4 right-1/3 w-1.5 md:w-2 h-4 md:h-6 bg-purple-400"
            animate={{ rotate: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <div className="w-2 md:w-3 h-2 md:h-3 bg-pink-400 rounded-full absolute -top-1" />
          </motion.div>
        </div>

        {/* Tekstballon */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-16 right-0 bg-white text-purple-900 p-3 rounded-xl rounded-br-none shadow-lg max-w-[200px]"
          >
            <p className="text-sm font-bold">{message}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}