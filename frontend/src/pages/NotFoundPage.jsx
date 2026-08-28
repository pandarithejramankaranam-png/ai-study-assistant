import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#2D2B2A] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-8 shadow-xs space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] flex items-center justify-center mx-auto shadow-2xs">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-[#C8A97E]">404</h1>
          <h2 className="text-xl font-bold text-[#2D2B2A]">Page Not Found</h2>
          <p className="text-xs text-[#77736B]">
            The study page or resource you are searching for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/dashboard"
            className="px-5 py-2.5 bg-[#C8A97E] hover:bg-[#B8976C] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
