import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosClient';
import { User, Mail, GraduationCap, BookOpen, Save, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export const ProfileSettingsPage = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [studyTarget, setStudyTarget] = useState(user?.studyTarget || '');
  const [bio, setBio] = useState(user?.bio || '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setInstitution(user.institution || '');
      setStudyTarget(user.studyTarget || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile({ name, institution, studyTarget, bio });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Update profile error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 text-left animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#2D2B2A] flex items-center gap-2.5">
          <User className="w-7 h-7 text-[#C8A97E]" /> Student Profile & Settings
        </h1>
        <p className="text-sm text-[#77736B] mt-1">
          Manage your personal information, academic institution, and study preferences.
        </p>
      </div>

      {/* Main Profile Form */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-[#A8B5A2]/15 border border-[#A8B5A2]/40 text-[#4A5D44] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#C5A0A0]/15 border border-[#C5A0A0]/40 text-[#8B4242] text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D2B2A] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A49F96] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2B2A] mb-1">Email Address (Read-only)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A49F96] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-[#F5F1E8] border border-[#E8E1D5] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#77736B] cursor-not-allowed font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D2B2A] mb-1">College / University</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-[#A49F96] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2B2A] mb-1">Major / Course Target</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-[#A49F96] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studyTarget}
                  onChange={(e) => setStudyTarget(e.target.value)}
                  placeholder="e.g. Computer Science B.S."
                  className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition font-semibold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D2B2A] mb-1">Academic Bio / Study Goals</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your study goals, exam targets, or research focus..."
              className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl p-3.5 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition placeholder:text-[#A49F96]"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#C8A97E] hover:bg-[#B8976C] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account Security Info Card */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#2D2B2A]">JWT Security & Encryption</h3>
          <p className="text-xs text-[#77736B]">
            Your session is secured using standard JSON Web Tokens (JWT) and passwords encrypted with bcrypt.
          </p>
        </div>
      </div>
    </div>
  );
};
