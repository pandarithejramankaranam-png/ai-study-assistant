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
  ArrowRight,
  Eye,
  Clock,
  Upload,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { MaterialViewModal } from '../components/MaterialViewModal';

export const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [materials, setMaterials] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Upload State
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const fetchData = async () => {
    try {
      const [matRes, convRes, savedRes] = await Promise.all([
        API.get('/materials'),
        API.get('/chat'),
        API.get('/ai/saved'),
      ]);
      setMaterials(matRes.data);
      setConversations(convRes.data);
      setSavedItems(savedRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleQuickUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title || selectedFile.name);

    try {
      await API.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadSuccess('Uploaded successfully!');
      setSelectedFile(null);
      setTitle('');
      fetchData();
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.response?.data?.message || err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const totalQuizzes = savedItems.filter((i) => i.type === 'mcq').length;
  const totalNotes = savedItems.filter((i) => i.type === 'notes' || i.type === 'summary').length;

  return (
    <div className="space-y-8 text-left animate-fade-in pb-12">
      {/* 1. Welcome Message Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#F5F1E8] border border-[#E8E1D5] p-6 md:p-8 shadow-xs">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E1D5] text-[#C8A97E] text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" /> Welcome, {user?.name || 'Student'}
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-[#2D2B2A]">
            StudyLens AI Workspace
          </h1>
          <p className="text-sm text-[#77736B] leading-relaxed">
            {user?.institution ? `${user.institution} • ${user.studyTarget}` : 'Upload study materials to begin generating instant summaries, quizzes, and revision guides.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C8A97E] hover:bg-[#B8976C] text-white text-xs font-bold shadow-xs transition"
            >
              <Bot className="w-4 h-4" /> Open AI Chat & Tools
            </Link>
            <Link
              to="/documents"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F1EBDD] border border-[#E8E1D5] text-[#2D2B2A] text-xs font-bold transition"
            >
              <FolderUp className="w-4 h-4 text-[#C8A97E]" /> Manage Documents
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Soft Upload Area */}
      <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E8E1D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#2D2B2A] flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#C8A97E]" /> Upload PDF, Image, or Audio File
          </h2>
          <span className="text-xs text-[#77736B]">Max file size: 25MB</span>
        </div>

        {uploadSuccess && (
          <div className="p-3 rounded-xl bg-[#A8B5A2]/15 border border-[#A8B5A2]/40 text-[#4A5D44] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {uploadSuccess}
          </div>
        )}
        {uploadError && (
          <div className="p-3 rounded-xl bg-[#C5A0A0]/15 border border-[#C5A0A0]/40 text-[#8B4242] text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {uploadError}
          </div>
        )}

        <form onSubmit={handleQuickUpload} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 relative border-2 border-dashed border-[#E8E1D5] hover:border-[#C8A97E] rounded-2xl p-4 text-center bg-[#FAF8F2] transition group">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.mp3,.wav"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <p className="text-xs font-semibold text-[#77736B] truncate">
              {selectedFile ? <span className="text-[#C8A97E] font-bold">{selectedFile.name}</span> : 'Click or drop PDF / Image / Audio file here'}
            </p>
          </div>

          <div className="md:col-span-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Material Title (Optional)"
              className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition placeholder:text-[#A49F96]"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-2.5 px-4 bg-[#C8A97E] hover:bg-[#B8976C] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              {uploading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" /> Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Statistics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#E8E1D5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#2D2B2A]">{materials.length}</p>
            <p className="text-xs text-[#77736B] font-semibold">Uploaded Materials</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#E8E1D5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F1E8] text-[#A8B5A2] border border-[#E8E1D5] flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#2D2B2A]">{conversations.length}</p>
            <p className="text-xs text-[#77736B] font-semibold">AI Chat Threads</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#E8E1D5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#2D2B2A]">{totalQuizzes}</p>
            <p className="text-xs text-[#77736B] font-semibold">Completed Quizzes</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFFFFF] border border-[#E8E1D5] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F1E8] text-[#A8B5A2] border border-[#E8E1D5] flex items-center justify-center shrink-0">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#2D2B2A]">{totalNotes}</p>
            <p className="text-xs text-[#77736B] font-semibold">Saved Study Notes</p>
          </div>
        </div>
      </div>

      {/* 4. AI Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#2D2B2A] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C8A97E]" /> AI Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Link
            to="/chat?tool=summarize"
            className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#C8A97E] hover:bg-[#F5F1E8]/50 transition shadow-xs group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F5F1E8] text-[#C8A97E] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#2D2B2A] group-hover:text-[#C8A97E] transition">Summarize</h3>
          </Link>

          <Link
            to="/chat?tool=explain"
            className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#A8B5A2] hover:bg-[#F5F1E8]/50 transition shadow-xs group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F5F1E8] text-[#A8B5A2] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#2D2B2A] group-hover:text-[#A8B5A2] transition">Explain Topic</h3>
          </Link>

          <Link
            to="/chat?tool=mcq"
            className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#C8A97E] hover:bg-[#F5F1E8]/50 transition shadow-xs group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F5F1E8] text-[#C8A97E] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#2D2B2A] group-hover:text-[#C8A97E] transition">Generate MCQs</h3>
          </Link>

          <Link
            to="/chat?tool=exam"
            className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#A8B5A2] hover:bg-[#F5F1E8]/50 transition shadow-xs group text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F5F1E8] text-[#A8B5A2] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#2D2B2A] group-hover:text-[#A8B5A2] transition">Predict Exam Qs</h3>
          </Link>

          <Link
            to="/chat?tool=notes"
            className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#C8A97E] hover:bg-[#F5F1E8]/50 transition shadow-xs group text-center col-span-2 md:col-span-1"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F5F1E8] text-[#C8A97E] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#2D2B2A] group-hover:text-[#C8A97E] transition">Study Notes</h3>
          </Link>
        </div>
      </div>

      {/* 5. Recent Uploads & Conversations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploaded Materials */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E8E1D5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2D2B2A] flex items-center gap-2">
              <FolderUp className="w-4 h-4 text-[#C8A97E]" /> Recent Uploaded Materials
            </h3>
            <Link to="/documents" className="text-xs font-bold text-[#C8A97E] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#77736B] animate-pulse">Loading study materials...</div>
          ) : materials.length === 0 ? (
            <div className="py-8 text-center space-y-3 bg-[#FAF8F2] rounded-2xl border border-[#E8E1D5]">
              <FileText className="w-8 h-8 text-[#A49F96] mx-auto" />
              <p className="text-xs text-[#77736B]">No study materials uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {materials.slice(0, 4).map((mat) => (
                <div
                  key={mat._id}
                  className="p-3 rounded-2xl bg-[#FAF8F2] border border-[#E8E1D5] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="uppercase text-[9px] font-extrabold px-2 py-1 rounded-md bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] shrink-0">
                      {mat.fileType}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2D2B2A] truncate">{mat.title}</p>
                      <p className="text-[11px] text-[#77736B] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(mat.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedMaterial(mat)}
                      className="p-1.5 text-[#77736B] hover:text-[#2D2B2A] rounded-xl hover:bg-[#F1EBDD] transition"
                      title="View file"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/documents/${mat._id}/analysis`}
                      className="px-2.5 py-1 text-[11px] font-bold bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] hover:bg-[#C8A97E] hover:text-white rounded-xl transition"
                    >
                      Analyze
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Conversations */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E8E1D5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2D2B2A] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#A8B5A2]" /> Recent Conversations
            </h3>
            <Link to="/chat" className="text-xs font-bold text-[#A8B5A2] hover:underline flex items-center gap-1">
              Open Chat <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#77736B] animate-pulse">Loading chat threads...</div>
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center space-y-3 bg-[#FAF8F2] rounded-2xl border border-[#E8E1D5]">
              <MessageSquare className="w-8 h-8 text-[#A49F96] mx-auto" />
              <p className="text-xs text-[#77736B]">No chat history found.</p>
              <Link
                to="/chat"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#A8B5A2] hover:bg-[#94A48E] text-white rounded-xl transition shadow-xs"
              >
                Start New Chat
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {conversations.slice(0, 4).map((conv) => (
                <div
                  key={conv._id}
                  className="p-3 rounded-2xl bg-[#FAF8F2] border border-[#E8E1D5] flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#2D2B2A] truncate">{conv.title}</p>
                    <p className="text-[10px] text-[#77736B] mt-0.5">
                      {conv.messages ? conv.messages.length : 0} messages • Updated {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Link
                    to={`/chat?id=${conv._id}`}
                    className="px-2.5 py-1 text-[11px] font-bold text-[#77736B] hover:text-[#2D2B2A] bg-[#FFFFFF] border border-[#E8E1D5] rounded-xl hover:bg-[#F5F1E8] transition shrink-0"
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
