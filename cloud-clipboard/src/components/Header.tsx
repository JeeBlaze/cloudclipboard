import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardCheck,
  Search,
  X,
  User,
  LogOut,
  LogIn,
  Cloud,
  ChevronDown,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAuth,
  isSyncing = false,
}) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Logo and App Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                Cloud Clipboard
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Copy anywhere, paste everywhere
            </p>
          </div>
        </div>

        {/* Search Bar (Only shown when authenticated) */}
        {user ? (
          <div className="flex-1 max-w-md relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search saved clips..."
                className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-950 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Actions & Account Menu */}
        <div className="flex items-center gap-3 shrink-0">
          
          {user ? (
            /* User Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all text-left shadow-xs cursor-pointer"
              >
                {/* Circle type profile avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs border border-indigo-400/30 shrink-0">
                  {user.email ? user.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                {/* Name for the email */}
                <span className="hidden sm:inline-block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[130px] truncate">
                  {user.displayName || (user.email ? user.email.split('@')[0] : 'Guest User')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs">
                  {/* Account Header */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl mb-1 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {user.email ? user.email.charAt(0).toUpperCase() : <User className="w-4.5 h-4.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs">
                          {user.displayName || (user.email ? user.email.split('@')[0] : 'Guest User')}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                          {user.email || 'Guest Account'}
                        </p>
                      </div>
                    </div>

                    {user.email === null && (
                      <div className="mt-2.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <span>Sign up to keep your clipboard synced permanently across devices.</span>
                      </div>
                    )}
                  </div>

                  {user.email === null && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenAuth('signup');
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-2 transition-colors mb-1 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Upgrade to Permanent Sync</span>
                    </button>
                  )}

                  {/* Classic Designed Logout Option */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-between group transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <LogOut className="w-3.5 h-3.5" />
                      </div>
                      <span>Log Out</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-rose-500 font-mono">
                      End session
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Auth buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
