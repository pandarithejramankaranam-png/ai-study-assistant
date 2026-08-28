import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, FileText, Mic, Image, BrainCircuit, ArrowRight, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

export const LandingAuthPage = () => {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) throw new Error('Name is required');
        await register(name, email, password);
      }
    } catch (err) {
      console.error('Auth submit error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            StudyLens <span className="text-indigo-400">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLogin(true)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition ${
              isLogin ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Hero & Auth Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 my-auto">
        {/* Left Column: Value Proposition */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" /> Powered by Google Gemini Multimodal AI
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight">
            Study Smarter with <br />
            <span className="text-gradient">Multimodal AI Power</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
            Upload your college textbooks, PDF lecture slides, handwritten notes, or audio lecture recordings. StudyLens AI comprehends them all to generate instant summaries, interactive quizzes, exam predictions, and revision notes!
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="text-xs font-medium text-slate-300">PDF Slide & Textbooks</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <Image className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium text-slate-300">Handwritten Notes</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <Mic className="w-5 h-5 text-purple-400 shrink-0" />
              <span className="text-xs font-medium text-slate-300">Voice Lectures</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-6 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant MCQ Generation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Exam Question Predictor
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400" /> Interactive Flashcards
            </span>
          </div>
        </div>

        {/* Right Column: Auth Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative">
            <div className="flex items-center justify-between mb-6 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setErrorMsg('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                  isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setErrorMsg('');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                  !isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <h2 className="text-xl font-bold text-white text-left mb-1">
              {isLogin ? 'Welcome Back!' : 'Join StudyLens AI'}
            </h2>
            <p className="text-xs text-slate-400 text-left mb-6">
              {isLogin ? 'Enter your credentials to access your study hub' : 'Create an account to upload study materials'}
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium text-left">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">College Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-500 relative z-10">
        © 2026 StudyLens AI – Multimodal AI Assistant for College Students. Built with React & Google Gemini API.
      </footer>
    </div>
  );
};
