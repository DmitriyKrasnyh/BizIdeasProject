// src/components/MascotAssistant.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mascotImage from '../assets/helper.png'; // путь к PNG маскоту

const hints = [
  'Нажми на кнопку "Идеи", чтобы увидеть предложения.',
  'Ты можешь зарегистрироваться, чтобы сохранить свои идеи.',
  'Нажми "Связаться", если возникли вопросы.',
];

export const MascotAssistant: React.FC = () => {
  const [show, setShow] = useState(true);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % hints.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-5 left-5 z-50">
      <div className="relative">
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-zinc-900 p-4 rounded-lg shadow-lg w-64 border border-zinc-700 mb-3"
            >
              <p className="text-sm text-white">{hints[hintIndex]}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.img
          src={mascotImage}
          alt="Маскот"
          onClick={() => setShow(!show)}
          className="w-20 cursor-pointer hover:scale-110 transition"
          animate={{
            y: [0, -5, 0],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
};
