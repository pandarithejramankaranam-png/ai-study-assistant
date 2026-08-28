import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Key, LogOut, Menu, X, BookOpen } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, customApiKey, setCustomApiKey } = useContext(AuthContext);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState(customApiKey);
  const [keySavedMsg, setKeySavedMsg] = useState('');

  const handleSaveKey = (e) => {
    e.preventDefault();
    setCustomApiKey(keyInput.trim());
    setKeySavedMsg('API key saved locally!');
    setTimeout(() => setKeySavedMsg(''), 3000);
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-[#E8E1D5] bg-[#FFFFFF]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-[#77736B] hover:text-[#2D2B2A] hover:bg-[#F5F1E8] rounded-xl transition"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C8A97E] flex items-center justify-center shadow-sm text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#2D2B2A] flex items-center gap-1.5">
                StudyLens <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] font-bold">AI 2.0</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* API Key settings button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#F5F1E8] hover:bg-[#F1EBDD] text-[#77736B] border border-[#E8E1D5] transition"
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-[#C8A97E]" />
            <span className="hidden sm:inline">API Key</span>
            {customApiKey ? (
              <span className="w-2 h-2 rounded-full bg-[#A8B5A2]"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#C8A97E]"></span>
            )}
          </button>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-[#E8E1D5]">
              <div className="w-8 h-8 rounded-full bg-[#F5F1E8] border border-[#E8E1D5] flex items-center justify-center text-xs font-bold text-[#C8A97E]">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-[#2D2B2A] leading-none">{user.name}</p>
                <p className="text-[10px] text-[#77736B] leading-tight mt-0.5">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-[#77736B] hover:text-[#C5A0A0] hover:bg-[#F5F1E8] rounded-xl transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2B2A]/30 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl max-w-md w-full p-6 shadow-xl relative text-left">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-[#77736B] hover:text-[#2D2B2A] p-1 rounded-xl hover:bg-[#F5F1E8] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2D2B2A]">Gemini API Settings</h3>
                <p className="text-xs text-[#77736B]">Optional custom key override</p>
              </div>
            </div>

            <p className="text-xs text-[#77736B] mb-4 leading-relaxed">
              By default, StudyLens AI uses the backend environment variable (<code className="text-[#C8A97E] bg-[#F5F1E8] px-1 py-0.5 rounded">GEMINI_API_KEY</code>). If you wish to enter your personal API Key, input it below.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2D2B2A] mb-1.5">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition font-mono placeholder:text-[#A49F96]"
                />
              </div>

              {keySavedMsg && (
                <p className="text-xs font-semibold text-[#A8B5A2] bg-[#A8B5A2]/10 border border-[#A8B5A2]/30 rounded-xl p-2.5">
                  ✓ {keySavedMsg}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                {customApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setKeyInput('');
                      setCustomApiKey('');
                      setKeySavedMsg('Cleared custom key. Reverted to backend env key.');
                    }}
                    className="px-3 py-2 text-xs font-semibold text-[#77736B] hover:text-[#2D2B2A] transition"
                  >
                    Clear Override
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold bg-[#C8A97E] hover:bg-[#B8976C] text-white rounded-xl shadow-md transition"
                >
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
