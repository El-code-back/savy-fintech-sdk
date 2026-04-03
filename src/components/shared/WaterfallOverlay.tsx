import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Droplets } from 'lucide-react';

export const WaterfallOverlay = () => {
  const { isWaterfallActive, setIsWaterfallActive } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (isWaterfallActive) {
      const timer = setTimeout(() => {
        setIsWaterfallActive(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isWaterfallActive, setIsWaterfallActive]);

  return (
    <AnimatePresence>
      {isWaterfallActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-[#110C1E]/90 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Waterfall particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100, x: (Math.random() - 0.5) * 200, opacity: 0 }}
                animate={{ 
                  y: 1000, 
                  opacity: [0, 1, 1, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1.5 + Math.random(), 
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                className="absolute top-0 w-1 h-12 bg-gradient-to-b from-[#B685FF] to-transparent rounded-full"
              />
            ))}

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center z-10"
            >
              <div className="w-24 h-24 bg-[#B685FF]/20 rounded-full flex items-center justify-center mb-6 mx-auto border border-[#B685FF]/30">
                <Droplets size={48} className="text-[#B685FF]" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Income Received</h2>
              <p className="text-[#8F8A9B] font-bold tracking-widest text-xs">WATERFALLING TO YOUR SAFES...</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
