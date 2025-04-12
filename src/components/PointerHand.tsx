import React from 'react';
import { motion } from 'framer-motion';

export const PointerHand: React.FC = () => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className="absolute z-50 w-10 h-10 -top-6 left-0"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <path
        fill="#fff"
        stroke="#000"
        strokeWidth="2"
        d="M30 4c-1.1 0-2 .9-2 2v20h-4V14c0-1.1-.9-2-2-2s-2 .9-2 2v12h-4V18c0-1.1-.9-2-2-2s-2 .9-2 2v14h-3c-1.1 0-2 .9-2 2v6c0 5.5 4.5 10 10 10h6.3c1.4 2.4 4 4 6.9 4 4.4 0 8-3.6 8-8V6c0-1.1-.9-2-2-2s-2 .9-2 2v24h-4V6c0-1.1-.9-2-2-2z"
      />
    </motion.svg>
  );
};
