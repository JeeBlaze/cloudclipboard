import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Header } from './components/Header';
import { ClipboardInput } from './components/ClipboardInput';
import { ClipboardList } from './components/ClipboardList';
import { EditModal } from './components/EditModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { SplashScreen } from './components/SplashScreen';
import { LandingAuthCard } from './components/LandingAuthCard';
import { useClipboard } from './hooks/useClipboard';
import { ClipboardItem } from './types';
import {
  ShieldCheck,
  Smartphone,
  Laptop,
  Zap,
  Sparkles,
  ArrowRight,
  Lock,
  Cloud
} from 'lucide-react';

function MainApp() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const {
    items,
    isLoading: clipsLoading,
    isSyncing,
    addClip,
    updateClip,
    togglePin,
    deleteClip
  } = useClipboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const [editingItem, setEditingItem] = useState<ClipboardItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ClipboardItem | null>(null);

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleCopyNotification = (_content: string) => {
    showToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* First-time Splash Screen */}
      <SplashScreen />

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuth={handleOpenAuth}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Unauthenticated View: Render Landing Auth Card */}
        {!authLoading && !user && (
          <LandingAuthCard />
        )}

        {/* Authenticated View: Render Dashboard */}
        {user && (
          <>
            {/* Guest Warning Notice */}
            {user.email === null && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">
                    You are currently using a temporary guest session. Sign up to permanently sync across your other devices!
                  </span>
                </div>
                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-xs shrink-0 transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Input Area */}
            <ClipboardInput onSave={addClip} isSaving={isSyncing} />

            {/* Clipboard Items List */}
            <ClipboardList
              items={items}
              isLoading={authLoading || clipsLoading}
              searchQuery={searchQuery}
              onCopy={handleCopyNotification}
              onEdit={(item) => setEditingItem(item)}
              onDeleteRequest={(item) => setDeletingItem(item)}
              onTogglePin={togglePin}
              onClearSearch={() => setSearchQuery('')}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-indigo-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Cloud Clipboard</span>
            <span>—</span>
            <span>Secure, instant cross-device clipboard</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Firebase Firestore & Auth</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      <EditModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={updateClip}
      />

      <DeleteConfirmModal
        item={deletingItem}
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={deleteClip}
      />

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
