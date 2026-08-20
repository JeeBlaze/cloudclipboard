import React, { useState } from 'react';
import { ClipboardItem, SortOrder } from '../types';
import { ClipboardCard } from './ClipboardCard';
import {
  SearchX,
  ClipboardX,
  ArrowUpDown,
  Pin,
  Layers,
  Sparkles
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ClipboardListProps {
  items: ClipboardItem[];
  isLoading: boolean;
  searchQuery: string;
  onCopy: (content: string) => void;
  onEdit: (item: ClipboardItem) => void;
  onDeleteRequest: (item: ClipboardItem) => void;
  onTogglePin: (item: ClipboardItem) => void;
  onClearSearch: () => void;
}

export const ClipboardList: React.FC<ClipboardListProps> = ({
  items,
  isLoading,
  searchQuery,
  onCopy,
  onEdit,
  onDeleteRequest,
  onTogglePin,
  onClearSearch,
}) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Filter items by search query
  const filteredItems = items.filter((item) =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOrder === 'alphabetical') {
      return a.content.localeCompare(b.content);
    }

    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();

    if (sortOrder === 'oldest') {
      return timeA - timeB;
    }
    // 'newest' default
    return timeB - timeA;
  });

  const pinnedItems = sortedItems.filter((i) => i.isPinned);
  const unpinnedItems = sortedItems.filter((i) => !i.isPinned);

  if (isLoading) {
    return (
      <div className="space-y-4 my-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
              <div className="flex gap-2">
                <div className="h-7 w-7 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="my-10 p-8 text-center bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center">
          <ClipboardX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Your cloud clipboard is empty
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
          Save notes, code snippets, links, or text entries above to instantly sync them across your devices.
        </p>
      </div>
    );
  }

  if (filteredItems.length === 0 && searchQuery) {
    return (
      <div className="my-10 p-8 text-center bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
          No matching clips found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
          No saved clips matched "{searchQuery}". Try a different keyword or clear your search query.
        </p>
        <button
          onClick={onClearSearch}
          className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          Clear search
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            {searchQuery
              ? `Filtered Clips (${sortedItems.length})`
              : `Saved Clips (${items.length})`}
          </span>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="sort-order-select" className="text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </label>
          <select
            id="sort-order-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Pinned Items Section */}
      {pinnedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 px-1">
            <Pin className="w-3.5 h-3.5 fill-current" />
            <span>Pinned Snippets ({pinnedItems.length})</span>
          </div>
          <div className="grid gap-3.5">
            <AnimatePresence>
              {pinnedItems.map((item) => (
                <ClipboardCard
                  key={item.id}
                  item={item}
                  onCopy={onCopy}
                  onEdit={onEdit}
                  onDeleteRequest={onDeleteRequest}
                  onTogglePin={onTogglePin}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Main Items Section */}
      <div className="grid gap-3.5">
        <AnimatePresence>
          {unpinnedItems.map((item) => (
            <ClipboardCard
              key={item.id}
              item={item}
              onCopy={onCopy}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
              onTogglePin={onTogglePin}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
