import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SplashScreen: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only once per browser session
    const seen = sessionStorage.getItem('cloud_clipboard_splash_seen');
    if (!seen) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('cloud_clipboard_splash_seen', 'true');
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none cursor-pointer"
        onClick={() => {
          setVisible(false);
          sessionStorage.setItem('cloud_clipboard_splash_seen', 'true');
        }}
      >
        {/* Glowing background halo */}
        <div className="absolute w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center text-center px-6"
        >
          {/* Logo Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-indigo-400/30">
              <ClipboardCheck className="w-10 h-10 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute -top-1.5 -right-1.5 p-1.5 rounded-full bg-slate-900 border border-indigo-500/40 text-amber-400 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Cloud Clipboard
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xs font-medium">
            Cross-device instant clipboard synchronization
          </p>

          {/* Loading bar */}
          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-8">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-full"
            />
          </div>

          <span className="text-[10px] text-slate-500 mt-4 tracking-wider uppercase font-semibold">
            Click anywhere to enter
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
