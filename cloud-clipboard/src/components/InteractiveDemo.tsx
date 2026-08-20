import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Sparkles, Send, Check, Copy, Laptop, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEMO_SNIPPETS = [
  'https://github.com/cloud-clipboard/sync-tool',
  'npx cloud-clip --device laptop-pro',
  'SECRET_API_KEY=sk_live_9847291039120',
];

export const InteractiveDemo: React.FC = () => {
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savedClips, setSavedClips] = useState<string[]>([]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fullText = DEMO_SNIPPETS[currentSnippetIndex];

    if (isTyping) {
      if (typedText.length < fullText.length) {
        timeout = setTimeout(() => {
          setTypedText(fullText.slice(0, typedText.length + 1));
        }, 45);
      } else {
        // Typing finished -> trigger save
        timeout = setTimeout(() => {
          setIsTyping(false);
          setIsSaved(true);
          setSavedClips((prev) => [fullText, ...prev.slice(0, 2)]);
        }, 300);
      }
    } else {
      // Pause after save, then clear and switch to next snippet
      timeout = setTimeout(() => {
        setIsSaved(false);
        setTypedText('');
        setIsTyping(true);
        setCurrentSnippetIndex((prev) => (prev + 1) % DEMO_SNIPPETS.length);
      }, 2500);
    }

    return () => clearTimeout(timeout);
  }, [typedText, isTyping, currentSnippetIndex]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Live Interactive Demo
            </h3>
            <p className="text-[11px] text-slate-400">
              Watch real-time typing & cross-device auto-saving
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Active Simulation</span>
        </div>
      </div>

      {/* Simulated Typing Box */}
      <div className="bg-slate-900 text-indigo-100 rounded-2xl p-4 font-mono text-xs shadow-inner relative border border-slate-800">
        <div className="flex items-center justify-between mb-2 text-slate-400 text-[10px]">
          <div className="flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulated Device (Laptop)</span>
          </div>
          <span>Cloud Clipboard Input</span>
        </div>

        <div className="min-h-[44px] flex items-center bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-indigo-300">
          <span>{typedText}</span>
          {isTyping && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="inline-block w-1.5 h-4 bg-indigo-400 ml-0.5"
            />
          )}
        </div>

        {/* Action Button */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            {isTyping ? 'Typing snippet...' : 'Saving to Firestore Cloud...'}
          </span>

          <motion.div
            animate={isSaved ? { scale: [1, 1.05, 1] } : {}}
            className={`px-3 py-1.5 rounded-xl font-sans text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved to Cloud Clipboard!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Saving...</span>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Live Synced Snippets List Preview */}
      {savedClips.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
              <span>Synced Mobile Devices Received:</span>
            </span>
            <span className="text-emerald-500">Instant Sync</span>
          </div>

          <div className="space-y-1.5">
            <AnimatePresence>
              {savedClips.map((clip, idx) => (
                <motion.div
                  key={clip + idx}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-slate-800 dark:text-slate-200"
                >
                  <span className="truncate pr-2">{clip}</span>
                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-sans font-medium">
                    Synced Just Now
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
