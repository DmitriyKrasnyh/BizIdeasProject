// src/components/FancyTooltip.tsx
import { HelpCircle } from 'lucide-react';
import { TooltipRenderProps } from 'react-joyride';
import { motion } from 'framer-motion';

export default function FancyTooltip({
  continuous, index, step,
  backProps, closeProps, primaryProps, tooltipProps,
}: TooltipRenderProps) {
  return (
    <motion.div
      {...tooltipProps}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1,    opacity: 1 }}
      exit={{   scale: 0.95, opacity: 0 }}
      transition={{ duration: .18 }}
      className="max-w-xs sm:max-w-sm bg-zinc-900 text-gray-200
                 rounded-2xl shadow-xl ring-1 ring-indigo-600/30"
    >
      {/* header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10
                      bg-gradient-to-r from-indigo-600/20 to-pink-600/10 rounded-t-2xl">
        <HelpCircle className="w-5 h-5 text-indigo-400" />
        <span className="font-semibold flex-1">{step.title}</span>
        <button {...closeProps} className="text-gray-400 hover:text-white">×</button>
      </div>

      {/* body */}
      <div className="px-4 py-4 text-sm leading-relaxed">{step.content}</div>

      {/* footer */}
      <div className="flex justify-between items-center px-4 pb-4">
        {index > 0 && (
          <button {...backProps}
                  className="text-indigo-400 hover:underline text-sm">
            Назад
          </button>
        )}
        {continuous && (
          <button {...primaryProps}
                  className="ml-auto px-4 py-1.5 rounded-full
                             bg-indigo-600 hover:bg-indigo-500 text-sm font-medium">
            {step.isLast ? 'Готово' : 'Дальше'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
