import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, HelpCircle, FileCheck, ArrowRight, Zap } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#2D2B2A] flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Pastel Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C8A97E]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#A8B5A2]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#C8A97E] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#2D2B2A]">
            StudyLens <span className="text-[#C8A97E]">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-bold px-4 py-2 rounded-xl text-[#77736B] hover:text-[#2D2B2A] hover:bg-[#F5F1E8] transition border border-[#E8E1D5]"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-xs font-bold px-4 py-2 rounded-xl bg-[#C8A97E] hover:bg-[#B8976C] text-white shadow-xs transition"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 space-y-16 relative z-10 my-auto">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F1E8] border border-[#E8E1D5] text-[#C8A97E] text-xs font-bold">
            <Zap className="w-3.5 h-3.5" /> Next-Gen Multimodal AI Study Assistant
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-[#2D2B2A] leading-tight tracking-tight">
            Learn 10x Faster with <br />
            <span className="text-warm-gradient">StudyLens AI</span>
          </h1>

          <p className="text-[#77736B] text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            The ultimate AI study companion for college students. Upload PDF textbooks, handwritten note images, or voice lecture recordings and let AI summarize, generate MCQs, predict exam questions, and explain complex topics!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-[#C8A97E] hover:bg-[#B8976C] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-2"
            >
              Get Started for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 bg-[#FFFFFF] hover:bg-[#F5F1E8] border border-[#E8E1D5] text-[#2D2B2A] font-bold text-xs rounded-2xl transition"
            >
              Sign In to Your Workspace
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E8E1D5] space-y-3 shadow-xs hover:border-[#C8A97E] transition">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#2D2B2A]">Multimodal File Support</h3>
            <p className="text-xs text-[#77736B] leading-relaxed">
              Upload PDF textbooks, lecture slides, handwritten note photos, or voice recordings for instant contextual AI processing.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E8E1D5] space-y-3 shadow-xs hover:border-[#A8B5A2] transition">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F1E8] text-[#A8B5A2] border border-[#E8E1D5] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#2D2B2A]">Interactive MCQs & Exam Predictor</h3>
            <p className="text-xs text-[#77736B] leading-relaxed">
              Generate custom multiple-choice test quizzes with instant scoring, feedback, and high-probability exam predictions.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E8E1D5] space-y-3 shadow-xs hover:border-[#C8A97E] transition">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#2D2B2A]">Smart Notes & Flashcards</h3>
            <p className="text-xs text-[#77736B] leading-relaxed">
              Create structured study notes, 1-page exam cheat sheets, and 3D revision flashcard decks in seconds.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#E8E1D5] text-center text-xs text-[#77736B] relative z-10">
        © 2026 StudyLens AI – Multimodal AI Assistant for College Students. Built with React & Node.js.
      </footer>
    </div>
  );
};
