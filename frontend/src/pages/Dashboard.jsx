import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axiosClient';
import {
  FileText,
  FolderUp,
  Bot,
  BookmarkCheck,
  Sparkles,
  HelpCircle,
  Brain,
  FileCheck,
  Plus,
  ArrowRight,
  Eye,
  Trash2,
  Clock,
} from 'lucide-react';
import { MaterialViewModal } from '../components/MaterialViewModal';

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [materials, setMaterials] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matRes, savedRes] = await Promise.all([
          API.get('/materials'),
          API.get('/ai/saved'),
        ]);
        setMaterials(matRes.data);
        setSavedItems(savedRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalQuizzes = savedItems.filter((i) => i.type === 'mcq').length;
  const totalNotes = savedItems.filter((i) => i.type === 'notes' || i.type === 'summary').length;
  const totalExamQs = savedItems.filter((i) => i.type === 'exam_questions').length;

  return (
    <div className="space-y-8 text-left animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/60 border border-indigo-500/20 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Welcome Back, {user?.name || 'Student'}
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Ready to master your courses today?
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Upload your lecture slides, notes, or audio to start generating interactive quizzes, exam predictions, and structured summaries using Gemini Multimodal AI.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/ai-workspace"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
            >
              <Bot className="w-4 h-4" /> Open AI Study Assistant
            </Link>
            <Link
              to="/materials"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <FolderUp className="w-4 h-4 text-indigo-400" /> Upload Study Materials
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{materials.length}</p>
            <p className="text-xs text-slate-400 font-medium">Uploaded Materials</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{totalQuizzes}</p>
            <p className="text-xs text-slate-400 font-medium">Completed Quizzes</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{totalExamQs}</p>
            <p className="text-xs text-slate-400 font-medium">Exam Question Sets</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{totalNotes}</p>
            <p className="text-xs text-slate-400 font-medium">Saved Study Notes</p>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" /> AI Study Launchpad
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/ai-workspace?mode=mcq"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/90 transition shadow-lg group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition">
              Generate MCQ Quiz
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Create instant interactive quizzes with answer explanations.
            </p>
          </Link>

          <Link
            to="/ai-workspace?mode=exam"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/90 transition shadow-lg group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition">
              Predict Exam Questions
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Get probable exam questions categorized by mark weightage.
            </p>
          </Link>

          <Link
            to="/ai-workspace?mode=notes"
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90 transition shadow-lg group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
              Generate Revision Notes
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Build cheat sheets, summaries, or flip cards in seconds.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Materials & Saved Outputs Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploaded Materials */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderUp className="w-4 h-4 text-indigo-400" /> Recent Study Materials
            </h3>
            <Link to="/materials" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500 animate-pulse">Loading study materials...</div>
          ) : materials.length === 0 ? (
            <div className="py-8 text-center space-y-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No study materials uploaded yet.</p>
              <Link
                to="/materials"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" /> Upload Material
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {materials.slice(0, 4).map((mat) => (
                <div
                  key={mat._id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="uppercase text-[10px] font-bold px-2 py-1 rounded bg-slate-800 text-indigo-400 shrink-0">
                      {mat.fileType}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{mat.title}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(mat.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedMaterial(mat)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="View file"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/ai-workspace?materialId=${mat._id}`}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition"
                    >
                      Study with AI
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Saved AI Artifacts */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-emerald-400" /> Recent Saved AI Insights
            </h3>
            <Link to="/saved-notes" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              View Saved Library <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500 animate-pulse">Loading saved outputs...</div>
          ) : savedItems.length === 0 ? (
            <div className="py-8 text-center space-y-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
              <BookmarkCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No saved quizzes or study notes yet.</p>
              <Link
                to="/ai-workspace"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
              >
                Generate AI Notes
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {savedItems.slice(0, 4).map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.type}
                    </span>
                    <p className="text-xs font-semibold text-white truncate mt-1">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Saved {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    to="/saved-notes"
                    className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition shrink-0"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* View Material Modal */}
      {selectedMaterial && (
        <MaterialViewModal material={selectedMaterial} onClose={() => setSelectedMaterial(null)} />
      )}
    </div>
  );
};
