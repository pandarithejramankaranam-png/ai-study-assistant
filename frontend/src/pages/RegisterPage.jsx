import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [studyTarget, setStudyTarget] = useState('Computer Science & Engineering');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await register(name, email, password, { institution, studyTarget });
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#2D2B2A] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#C8A97E]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-8 shadow-md relative z-10 text-left space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#C8A97E] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-[#2D2B2A]">StudyLens AI</span>
          </Link>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5]">
            Sign Up
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black text-[#2D2B2A]">Create Your Account</h1>
          <p className="text-xs text-[#77736B] mt-1">Join thousands of students mastering their courses</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#C5A0A0]/10 border border-[#C5A0A0]/30 text-[#A85555] text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2D2B2A] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Morgan"
              className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition placeholder:text-[#A49F96]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D2B2A] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition placeholder:text-[#A49F96]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D2B2A] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition placeholder:text-[#A49F96]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#2D2B2A] mb-1">College/University</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="MIT / Stanford"
                className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl px-3 py-2 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition placeholder:text-[#A49F96]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#2D2B2A] mb-1">Major / Course</label>
              <input
                type="text"
                value={studyTarget}
                onChange={(e) => setStudyTarget(e.target.value)}
                placeholder="Computer Science"
                className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl px-3 py-2 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition placeholder:text-[#A49F96]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#C8A97E] hover:bg-[#B8976C] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#77736B] pt-2 border-t border-[#E8E1D5]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#C8A97E] font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};
