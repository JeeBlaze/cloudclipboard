import React, { useState } from 'react';
import { ClipboardItem } from '../types';
import { formatRelativeTime, formatExactTime } from '../utils/date';
import {
  Copy,
  Check,
  Edit2,
  Trash2,
  Pin,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Code2,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../context/ToastContext';

interface ClipboardCardProps {
  item: ClipboardItem;
  onCopy: (content: string) => void;
  onEdit: (item: ClipboardItem) => void;
  onDeleteRequest: (item: ClipboardItem) => void;
  onTogglePin: (item: ClipboardItem) => void;
}

export const ClipboardCard: React.FC<ClipboardCardProps> = ({
  item,
  onCopy,
  onEdit,
  onDeleteRequest,
  onTogglePin,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);
      onCopy(item.content);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
      showToast('Failed to copy text to clipboard', 'error');
    }
  };

  const isLongText = item.content.length > 280 || item.content.split('\n').length > 5;
  const isUrl = /^https?:\/\/[^\s]+$/i.test(item.content.trim());
  const isCode = /[{};=<>[\]()$#]/g.test(item.content) && item.content.length > 15;

  const displayContent = isLongText && !isExpanded
    ? item.content.slice(0, 280) + '...'
    : item.content;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all ${
        item.isPinned
          ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/20 dark:bg-amber-950/10'
          : 'border-slate-200/90 dark:border-slate-800'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span title={formatExactTime(item.updatedAt || item.createdAt)} className="font-medium">
            {formatRelativeTime(item.updatedAt || item.createdAt)}
          </span>
          {item.updatedAt && item.createdAt && item.updatedAt !== item.createdAt && (
            <span className="text-[10px] text-slate-400 italic">(edited)</span>
          )}

          {/* Badges for URL or Code */}
          {isUrl && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              <ExternalLink className="w-2.5 h-2.5" /> URL
            </span>
          )}
          {isCode && !isUrl && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900">
              <Code2 className="w-2.5 h-2.5" /> Code Snippet
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Pin Button */}
          <button
            onClick={() => onTogglePin(item)}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              item.isPinned
                ? 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40'
                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={item.isPinned ? 'Unpin snippet' : 'Pin to top'}
          >
            <Pin className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Edit item"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDeleteRequest(item)}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Delete item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Primary Copy Button */}
          <button
            onClick={handleCopy}
            className={`ml-1.5 px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative">
        <pre className="font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words overflow-x-auto selection:bg-indigo-200 dark:selection:bg-indigo-900">
          {displayContent}
        </pre>

        {isUrl && (
          <div className="mt-2.5">
            <a
              href={item.content.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>Open URL in new tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Footer Info & Expand Toggle */}
      <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/40 font-mono">
        <div className="flex items-center gap-3">
          <span>{item.content.length} characters</span>
          <span>•</span>
          <span>{item.content.trim().split(/\s+/).length} words</span>
        </div>

        {isLongText && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-sans font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <span>{isExpanded ? 'Show less' : 'Show more'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </motion.div>
  );
};
