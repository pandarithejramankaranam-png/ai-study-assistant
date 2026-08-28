import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import {
  Bot,
  MessageSquare,
  BookOpen,
  FileCheck,
  HelpCircle,
  Brain,
  Layers,
  Sparkles,
  Send,
  Save,
  CheckCircle2,
  FileText,
  AlertCircle,
  Copy,
  Check,
  Play,
  RotateCw,
} from 'lucide-react';
import { QuizModal } from '../components/QuizModal';
import { FlashcardViewer } from '../components/FlashcardViewer';

export const AIWorkspace = () => {
  const [searchParams] = useSearchParams();
  const { customApiKey } = useContext(AuthContext);

  const initialMaterialId = searchParams.get('materialId');
  const initialMode = searchParams.get('mode') || 'chat';

  const [materials, setMaterials] = useState([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState(
    initialMaterialId ? [initialMaterialId] : []
  );
  const [activeTab, setActiveTab] = useState(initialMode); // 'chat' | 'explain' | 'summarize' | 'mcq' | 'exam' | 'notes'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Chat State
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am StudyLens AI. Select your study materials above and ask me anything, or pick one of the study modes to generate quizzes, summaries, and revision notes.',
    },
  ]);

  // Topic Explainer State
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState('detailed');
  const [explanationOutput, setExplanationOutput] = useState('');

  // Summarizer State
  const [sumLength, setSumLength] = useState('medium');
  const [summaryOutput, setSummaryOutput] = useState('');

  // MCQ Quiz State
  const [mcqCount, setMcqCount] = useState(5);
  const [mcqDifficulty, setMcqDifficulty] = useState('medium');
  const [mcqTopic, setMcqTopic] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // Exam Questions State
  const [examTopic, setExamTopic] = useState('');
  const [examCount, setExamCount] = useState(5);
  const [examOutput, setExamOutput] = useState('');

  // Study Notes / Flashcards State
  const [notesFormat, setNotesFormat] = useState('summary');
  const [notesTopic, setNotesTopic] = useState('');
  const [notesOutput, setNotesOutput] = useState(null);

  // Saved Output Status
  const [savedSuccess, setSavedSuccess] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await API.get('/materials');
        setMaterials(res.data);
      } catch (err) {
        console.error('Error loading materials:', err);
      }
    };
    fetchMaterials();
  }, []);

  const toggleMaterialSelect = (id) => {
    setSelectedMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToProfile = async (title, type, content) => {
    try {
      await API.post('/ai/save', {
        title,
        type,
        content,
        materialIds: selectedMaterialIds,
      });
      setSavedSuccess('Saved to your profile successfully!');
      setTimeout(() => setSavedSuccess(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  // --- Handlers for AI endpoints ---
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question.trim();
    setQuestion('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userQ }]);
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await API.post('/ai/ask', {
        question: userQ,
        materialIds: selectedMaterialIds,
        customApiKey,
      });

      setChatHistory((prev) => [...prev, { sender: 'ai', text: res.data.answer }]);
    } catch (err) {
      console.error('Ask AI error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainTopic = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await API.post('/ai/explain', {
        topic,
        materialIds: selectedMaterialIds,
        depth,
        customApiKey,
      });
      setExplanationOutput(res.data.explanation);
    } catch (err) {
      console.error('Explain error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Explanation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (selectedMaterialIds.length === 0) {
      setErrorMsg('Please select at least one study material from the top bar to generate a summary.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await API.post('/ai/summarize', {
        materialIds: selectedMaterialIds,
        length: sumLength,
        customApiKey,
      });
      setSummaryOutput(res.data.summary);
    } catch (err) {
      console.error('Summarize error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Summary failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMCQs = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await API.post('/ai/generate-mcqs', {
        materialIds: selectedMaterialIds,
        topic: mcqTopic,
        count: Number(mcqCount),
        difficulty: mcqDifficulty,
        customApiKey,
      });
      setQuizData(res.data);
      setShowQuizModal(true);
    } catch (err) {
      console.error('MCQ error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'MCQ generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateExamQs = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await API.post('/ai/generate-questions', {
        materialIds: selectedMaterialIds,
        topic: examTopic,
        count: Number(examCount),
        customApiKey,
      });
      setExamOutput(res.data.questionsContent);
    } catch (err) {
      console.error('Exam Qs error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Exam question generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNotes = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await API.post('/ai/generate-notes', {
        materialIds: selectedMaterialIds,
        topic: notesTopic,
        format: notesFormat,
        customApiKey,
      });
      setNotesOutput(res.data.notes);
    } catch (err) {
      console.error('Notes error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Notes generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-indigo-400" /> Multimodal AI Study Lens
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Grounded in your uploaded study materials powered by Google Gemini API
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> {savedSuccess}
          </div>
        )}
      </div>

      {/* Material Selection Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Attach Materials as AI Context ({selectedMaterialIds.length} Selected)
          </span>
          {materials.length > 0 && (
            <button
              onClick={() =>
                setSelectedMaterialIds(
                  selectedMaterialIds.length === materials.length ? [] : materials.map((m) => m._id)
                )
              }
              className="text-[11px] font-semibold text-indigo-400 hover:underline"
            >
              {selectedMaterialIds.length === materials.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {materials.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-1">
            No study materials uploaded yet. AI will respond using general academic knowledge.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {materials.map((mat) => {
              const isSelected = selectedMaterialIds.includes(mat._id);
              return (
                <button
                  key={mat._id}
                  onClick={() => toggleMaterialSelect(mat._id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="uppercase text-[9px] font-bold px-1 rounded bg-slate-800">
                    {mat.fileType}
                  </span>
                  <span className="max-w-[150px] truncate">{mat.title}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
        {[
          { id: 'chat', label: 'Ask AI Chat', icon: MessageSquare },
          { id: 'explain', label: 'Topic Explainer', icon: BookOpen },
          { id: 'summarize', label: 'Summarizer', icon: FileText },
          { id: 'mcq', label: 'MCQ Quiz Generator', icon: HelpCircle },
          { id: 'exam', label: 'Exam Question Predictor', icon: Brain },
          { id: 'notes', label: 'Notes & Flashcards', icon: FileCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setErrorMsg('');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* ================= TAB 1: ASK AI CHAT ================= */}
      {activeTab === 'chat' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[600px]">
          {/* Chat message stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none font-mono text-xs whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                  Gemini is thinking and analyzing context...
                </div>
              </div>
            )}
          </div>

          {/* Input box */}
          <form onSubmit={handleAskQuestion} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask any question about your study materials..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-lg shadow-indigo-600/30 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ================= TAB 2: TOPIC EXPLAINER ================= */}
      {activeTab === 'explain' && (
        <div className="space-y-6">
          <form onSubmit={handleExplainTopic} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Deep-Dive Topic Explainer
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Topic or Concept Name</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Backpropagation in Neural Networks or Photosynthesis Light Reactions"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Explanation Depth</label>
                <select
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="simple">Simple / ELI5 (Beginner)</option>
                  <option value="detailed">Detailed Technical Breakdown</option>
                  <option value="analogy">Intuitive Real-World Analogy</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Analyzing & Explaining...' : 'Explain Topic'}
              </button>
            </div>
          </form>

          {explanationOutput && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white">Explanation Result: {topic}</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(explanationOutput)}
                    className="p-1.5 text-xs text-slate-400 hover:text-white bg-slate-950 rounded-lg border border-slate-800 transition flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => handleSaveToProfile(`Explanation: ${topic}`, 'explanation', explanationOutput)}
                    className="p-1.5 text-xs text-indigo-400 hover:text-white bg-indigo-500/10 rounded-lg border border-indigo-500/30 transition flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Note
                  </button>
                </div>
              </div>
              <pre className="text-xs text-slate-200 bg-slate-950 p-5 rounded-2xl border border-slate-800 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {explanationOutput}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: EXECUTIVE SUMMARIZER ================= */}
      {activeTab === 'summarize' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Executive Material Summarizer
            </h3>
            <p className="text-xs text-slate-400">
              Summarizes selected study materials into bullet points, key terminology, and revision takeaways.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Summary Detail Level</label>
                <select
                  value={sumLength}
                  onChange={(e) => setSumLength(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="short">Short (Quick 1-minute read)</option>
                  <option value="medium">Medium (Standard Chapter Overview)</option>
                  <option value="comprehensive">Comprehensive (Deep Exam Review)</option>
                </select>
              </div>

              <button
                onClick={handleSummarize}
                disabled={loading}
                className="mt-5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Generating Summary...' : 'Generate Executive Summary'}
              </button>
            </div>
          </div>

          {summaryOutput && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white">Generated Summary</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(summaryOutput)}
                    className="p-1.5 text-xs text-slate-400 hover:text-white bg-slate-950 rounded-lg border border-slate-800 transition flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => handleSaveToProfile('Material Summary', 'summary', summaryOutput)}
                    className="p-1.5 text-xs text-emerald-400 hover:text-white bg-emerald-500/10 rounded-lg border border-emerald-500/30 transition flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Summary
                  </button>
                </div>
              </div>
              <pre className="text-xs text-slate-200 bg-slate-950 p-5 rounded-2xl border border-slate-800 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {summaryOutput}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: MCQ QUIZ GENERATOR ================= */}
      {activeTab === 'mcq' && (
        <div className="space-y-6">
          <form onSubmit={handleGenerateMCQs} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" /> Interactive MCQ Quiz Generator
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Specific Topic (Optional)</label>
                <input
                  type="text"
                  value={mcqTopic}
                  onChange={(e) => setMcqTopic(e.target.value)}
                  placeholder="e.g. Organic Chemistry Reactions"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Questions</label>
                <select
                  value={mcqCount}
                  onChange={(e) => setMcqCount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value={3}>3 Questions (Quick check)</option>
                  <option value={5}>5 Questions (Standard)</option>
                  <option value={10}>10 Questions (Full test)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty Level</label>
                <select
                  value={mcqDifficulty}
                  onChange={(e) => setMcqDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="easy">Easy (Fundamentals)</option>
                  <option value="medium">Medium (Standard Exam)</option>
                  <option value="hard">Hard (Advanced Application)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Building Quiz Questions...' : 'Generate & Launch Interactive Quiz'}
              </button>
            </div>
          </form>

          {quizData && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <p className="text-sm font-bold text-white">
                Generated {quizData.mcqs.length} MCQ Questions for "{quizData.topic}"
              </p>
              <button
                onClick={() => setShowQuizModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition"
              >
                <Play className="w-4 h-4 fill-white" /> Start Interactive Quiz Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: EXAM PREDICTOR ================= */}
      {activeTab === 'exam' && (
        <div className="space-y-6">
          <form onSubmit={handleGenerateExamQs} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" /> High-Yield Exam Question Predictor
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Focus Topic / Chapter</label>
                <input
                  type="text"
                  value={examTopic}
                  onChange={(e) => setExamTopic(e.target.value)}
                  placeholder="e.g. Operating System Process Synchronization"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Question Count</label>
                <select
                  value={examCount}
                  onChange={(e) => setExamCount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value={5}>5 Questions</option>
                  <option value={8}>8 Questions</option>
                  <option value={12}>12 Questions</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Predicting Questions...' : 'Predict Exam Questions'}
              </button>
            </div>
          </form>

          {examOutput && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white">Predicted Exam Paper</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(examOutput)}
                    className="p-1.5 text-xs text-slate-400 hover:text-white bg-slate-950 rounded-lg border border-slate-800 transition flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => handleSaveToProfile('Exam Questions', 'exam_questions', examOutput)}
                    className="p-1.5 text-xs text-purple-400 hover:text-white bg-purple-500/10 rounded-lg border border-purple-500/30 transition flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Paper
                  </button>
                </div>
              </div>
              <pre className="text-xs text-slate-200 bg-slate-950 p-5 rounded-2xl border border-slate-800 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {examOutput}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 6: NOTES & FLASHCARDS ================= */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <form onSubmit={handleGenerateNotes} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" /> Smart Notes & Flashcards Generator
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Topic / Subject</label>
                <input
                  type="text"
                  value={notesTopic}
                  onChange={(e) => setNotesTopic(e.target.value)}
                  placeholder="e.g. Data Structures - Trees & Graphs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Format Type</label>
                <select
                  value={notesFormat}
                  onChange={(e) => setNotesFormat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="summary">Structured Study Notes</option>
                  <option value="flashcards">Interactive Flashcard Deck</option>
                  <option value="cheatsheet">1-Page Exam Cheatsheet</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating Notes...' : 'Generate Notes / Flashcards'}
              </button>
            </div>
          </form>

          {notesOutput && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Generated Output ({notesFormat})</h4>
                <button
                  onClick={() => handleSaveToProfile(`Notes: ${notesTopic || 'Study Note'}`, 'notes', notesOutput)}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save to Profile
                </button>
              </div>

              {notesFormat === 'flashcards' && Array.isArray(notesOutput) ? (
                <FlashcardViewer flashcards={notesOutput} />
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                  <pre className="text-xs text-slate-200 bg-slate-950 p-5 rounded-2xl border border-slate-800 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                    {typeof notesOutput === 'string' ? notesOutput : JSON.stringify(notesOutput, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Interactive Quiz Runner Modal */}
      {showQuizModal && quizData && (
        <QuizModal quizData={quizData} onClose={() => setShowQuizModal(false)} />
      )}
    </div>
  );
};
