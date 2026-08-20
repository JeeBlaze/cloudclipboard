import React, { useState, useRef } from 'react';
import { Plus, Trash2, ClipboardPaste, Send, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ClipboardInputProps {
  onSave: (content: string) => Promise<boolean>;
  isSaving?: boolean;
}

export const ClipboardInput: React.FC<ClipboardInputProps> = ({ onSave, isSaving = false }) => {
  const [text, setText] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      showToast('Clipboard entry cannot be empty.', 'error');
      textareaRef.current?.focus();
      return;
    }

    const success = await onSave(trimmed);
    if (success) {
      setText('');
      showToast('Saved to Cloud Clipboard!', 'success');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd + Enter or Ctrl + Enter to quickly save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const handlePasteFromDevice = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        showToast('Clipboard paste permission is not supported in this browser.', 'error');
        return;
      }
      const clipText = await navigator.clipboard.readText();
      if (!clipText) {
        showToast('System clipboard is empty.', 'info');
        return;
      }
      setText((prev) => (prev ? `${prev}\n${clipText}` : clipText));
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 2000);
      showToast('Pasted text from system clipboard.', 'success');
    } catch (err) {
      console.error('Clipboard paste failed:', err);
      showToast('Unable to read clipboard. Please paste manually (Ctrl+V / Cmd+V).', 'info');
    }
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split('\n').length : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-5 transition-all">
      <div className="flex items-center justify-between mb-3">
        <label htmlFor="clipboard-input" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-indigo-500" />
          <span>New Clipboard Entry</span>
        </label>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePasteFromDevice}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg transition-colors cursor-pointer"
            title="Paste from system clipboard"
          >
            {pasteSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Pasted</span>
              </>
            ) : (
              <>
                <ClipboardPaste className="w-3.5 h-3.5 text-slate-500" />
                <span>Paste from Device</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative group">
        <textarea
          id="clipboard-input"
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste or type text, code snippets, URLs, or notes here... (Press Cmd/Ctrl + Enter to save)"
          rows={4}
          className="w-full p-3.5 text-sm font-mono bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-y transition-all"
        />
      </div>

      {/* Bottom bar with counts and actions */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>{charCount} chars</span>
          <span>•</span>
          <span>{wordCount} words</span>
          {lineCount > 1 && (
            <>
              <span>•</span>
              <span>{lineCount} lines</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {text.length > 0 && (
            <button
              type="button"
              onClick={() => setText('')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !text.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Save to Clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
