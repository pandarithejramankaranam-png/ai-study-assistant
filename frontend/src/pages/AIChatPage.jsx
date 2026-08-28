import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import {
  Bot,
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Layers,
  Check,
  FileText,
  HelpCircle,
  Brain,
  FileCheck,
  Image as ImageIcon,
  Music,
  AlertCircle,
  Copy,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { QuizModal } from '../components/QuizModal';

export const AIChatPage = () => {
  const [searchParams] = useSearchParams();
  const activeToolParam = searchParams.get('tool');
  const initialMaterialId = searchParams.get('materialId');

  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState(
    initialMaterialId ? [initialMaterialId] : []
  );

  const [activeTool, setActiveTool] = useState(activeToolParam || 'chat');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Welcome to StudyLens Multimodal AI! Select your study materials above (PDFs, Images, Audio, Notes) and ask any question or click an AI Tool button below.',
      toolUsed: '',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState('');

  // MCQ Quiz Modal State
  const [quizData, setQuizData] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await API.get('/chat');
      setConversations(res.data);
      if (res.data.length > 0 && !currentConvId) {
        setCurrentConvId(res.data[0]._id);
        setMessages(res.data[0].messages || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await API.get('/materials');
      setMaterials(res.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchMaterials();
  }, []);

  const handleSelectConversation = (conv) => {
    setCurrentConvId(conv._id);
    setMessages(conv.messages || []);
    if (conv.selectedMaterialIds && conv.selectedMaterialIds.length > 0) {
      setSelectedMaterialIds(conv.selectedMaterialIds);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await API.post('/chat', {
        title: 'New AI Study Session',
        selectedMaterialIds,
      });
      setConversations((prev) => [res.data, ...prev]);
      setCurrentConvId(res.data._id);
      setMessages([
        {
          sender: 'ai',
          text: 'New chat thread started! How can I assist with your study materials today?',
        },
      ]);
    } catch (err) {
      console.error('Create conversation error:', err);
    }
  };

  const handleDeleteConversation = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat history thread?')) return;
    try {
      await API.delete(`/chat/${id}`);
      const updated = conversations.filter((c) => c._id !== id);
      setConversations(updated);
      if (currentConvId === id) {
        if (updated.length > 0) {
          setCurrentConvId(updated[0]._id);
          setMessages(updated[0].messages || []);
        } else {
          setCurrentConvId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Delete conversation error:', err);
    }
  };

  const toggleMaterialSelect = (id) => {
    setSelectedMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveToProfile = async (title, type, content) => {
    try {
      await API.post('/ai/save', {
        title,
        type,
        content,
        materialIds: selectedMaterialIds,
      });
      setSavedSuccess('Saved to your profile!');
      setTimeout(() => setSavedSuccess(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleSendMessage = async (e, forcedTool = null) => {
    if (e) e.preventDefault();

    const tool = forcedTool || activeTool;
    const query = inputQuery.trim();

    if (!query && tool === 'chat') return;

    setErrorMsg('');
    setLoading(true);

    const userText = query || `Run ${tool.toUpperCase()} on selected study materials`;
    setInputQuery('');

    const newMessages = [...messages, { sender: 'user', text: userText, toolUsed: tool }];
    setMessages(newMessages);

    try {
      let endpoint = '/ai/ask';
      let payload = {
        question: userText,
        materialIds: selectedMaterialIds,
        conversationId: currentConvId,
      };

      if (tool === 'summarize') {
        endpoint = '/ai/summarize';
        payload = { materialIds: selectedMaterialIds, length: 'medium', conversationId: currentConvId };
      } else if (tool === 'explain') {
        endpoint = '/ai/explain';
        payload = { topic: query || 'Selected Study Materials', materialIds: selectedMaterialIds, depth: 'detailed', conversationId: currentConvId };
      } else if (tool === 'analyze_image') {
        endpoint = '/ai/analyze-image';
        payload = { materialIds: selectedMaterialIds, conversationId: currentConvId };
      } else if (tool === 'mcq') {
        endpoint = '/ai/generate-mcqs';
        payload = { topic: query || 'Study Quiz', materialIds: selectedMaterialIds, count: 5, difficulty: 'medium', conversationId: currentConvId };
      } else if (tool === 'exam') {
        endpoint = '/ai/generate-questions';
        payload = { topic: query || 'Exam Questions', materialIds: selectedMaterialIds, count: 5, conversationId: currentConvId };
      } else if (tool === 'notes') {
        endpoint = '/ai/generate-notes';
        payload = { topic: query || 'Revision Notes', materialIds: selectedMaterialIds, format: 'summary', conversationId: currentConvId };
      } else if (tool === 'analyze_audio') {
        endpoint = '/ai/analyze-audio';
        payload = { materialIds: selectedMaterialIds, conversationId: currentConvId };
      }

      const res = await API.post(endpoint, payload);

      let aiResponseText = '';
      if (res.data.answer) aiResponseText = res.data.answer;
      else if (res.data.summary) aiResponseText = res.data.summary;
      else if (res.data.explanation) aiResponseText = res.data.explanation;
      else if (res.data.analysis) aiResponseText = res.data.analysis;
      else if (res.data.questionsContent) aiResponseText = res.data.questionsContent;
      else if (res.data.notes) {
        aiResponseText = typeof res.data.notes === 'string' ? res.data.notes : JSON.stringify(res.data.notes, null, 2);
      } else if (res.data.mcqs) {
        setQuizData(res.data);
        setShowQuizModal(true);
        aiResponseText = `🎯 Generated ${res.data.mcqs.length} MCQ Questions for "${res.data.topic}". Click "Start Interactive Quiz" below to take the test!`;
      }

      const updatedMessages = [...newMessages, { sender: 'ai', text: aiResponseText, toolUsed: tool }];
      setMessages(updatedMessages);

      if (res.data.conversationId) {
        setCurrentConvId(res.data.conversationId);
        fetchConversations();
      }
    } catch (err) {
      console.error('AI execution error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Error communicating with Gemini AI API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col md:flex-row gap-4 pb-4 text-left animate-fade-in">
      {/* 1. Chat History Sidebar */}
      <div className="w-full md:w-72 bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-4 flex flex-col shadow-xs shrink-0">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#E8E1D5]">
          <span className="text-xs font-bold text-[#2D2B2A] flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#C8A97E]" /> Chat History
          </span>
          <button
            onClick={handleNewConversation}
            className="p-1.5 bg-[#C8A97E] hover:bg-[#B8976C] text-white rounded-xl transition flex items-center gap-1 text-[11px] font-bold shadow-xs"
            title="Start New Chat"
          >
            <Plus className="w-3.5 h-3.5" /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-[#77736B] italic p-3 text-center">No chat threads yet</p>
          ) : (
            conversations.map((conv) => {
              const isActive = conv._id === currentConvId;
              return (
                <div
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-2.5 rounded-xl text-xs font-medium cursor-pointer transition flex items-center justify-between group ${
                    isActive
                      ? 'bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] font-bold'
                      : 'text-[#77736B] hover:text-[#2D2B2A] hover:bg-[#FAF8F2]'
                  }`}
                >
                  <span className="truncate pr-2">{conv.title}</span>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#77736B] hover:text-[#C5A0A0] transition rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Main Multimodal AI Chat Panel */}
      <div className="flex-1 bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-4 md:p-6 flex flex-col shadow-xs overflow-hidden">
        {/* Selected Materials Bar */}
        <div className="pb-3 border-b border-[#E8E1D5] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#77736B]">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#C8A97E]" /> Select Study Context ({selectedMaterialIds.length} Selected)
            </span>
            {savedSuccess && (
              <span className="text-[#A8B5A2] text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {savedSuccess}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {materials.length === 0 ? (
              <span className="text-xs text-[#77736B] italic">No files uploaded yet. AI will answer using general academic knowledge.</span>
            ) : (
              materials.map((mat) => {
                const isSelected = selectedMaterialIds.includes(mat._id);
                return (
                  <button
                    key={mat._id}
                    onClick={() => toggleMaterialSelect(mat._id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#F5F1E8] border-[#C8A97E] text-[#C8A97E] font-bold'
                        : 'bg-[#FAF8F2] border-[#E8E1D5] text-[#77736B] hover:text-[#2D2B2A]'
                    }`}
                  >
                    <span className="uppercase text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#FAF8F2] border border-[#E8E1D5]">{mat.fileType}</span>
                    <span className="max-w-[120px] truncate">{mat.title}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#C8A97E]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* AI Tools Toolbar */}
        <div className="py-3 flex items-center gap-1.5 overflow-x-auto border-b border-[#E8E1D5]">
          {[
            { id: 'chat', label: 'Ask Question', icon: MessageSquare },
            { id: 'summarize', label: 'Summarize PDF', icon: FileText },
            { id: 'explain', label: 'Explain Topic', icon: Bot },
            { id: 'analyze_image', label: 'Analyze Image/Notes', icon: ImageIcon },
            { id: 'mcq', label: 'Generate MCQs', icon: HelpCircle },
            { id: 'exam', label: 'Important Qs', icon: Brain },
            { id: 'notes', label: 'Study Notes', icon: FileCheck },
            { id: 'analyze_audio', label: 'Analyze Audio', icon: Music },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                  isActive
                    ? 'bg-[#C8A97E] text-white shadow-xs font-bold'
                    : 'bg-[#FAF8F2] text-[#77736B] hover:text-[#2D2B2A] border border-[#E8E1D5]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="my-2 p-3 rounded-xl bg-[#C5A0A0]/15 border border-[#C5A0A0]/40 text-[#8B4242] text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-2xl bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed relative group ${
                  msg.sender === 'user'
                    ? 'bg-[#F5F1E8] text-[#2D2B2A] border border-[#E8E1D5] rounded-br-none text-sm font-medium'
                    : 'bg-[#FAF8F2] text-[#2D2B2A] border border-[#E8E1D5] rounded-bl-none font-mono whitespace-pre-wrap'
                }`}
              >
                {msg.text}

                {msg.sender === 'ai' && (
                  <div className="mt-3 pt-2 border-t border-[#E8E1D5] flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleCopyText(msg.text, idx)}
                      className="text-[10px] text-[#77736B] hover:text-[#2D2B2A] flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E8E1D5]"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-[#A8B5A2]" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === idx ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleSaveToProfile('AI Study Response', 'notes', msg.text)}
                      className="text-[10px] text-[#C8A97E] hover:text-[#2D2B2A] flex items-center gap-1 px-2 py-0.5 rounded bg-[#F5F1E8] border border-[#E8E1D5]"
                    >
                      <Save className="w-3 h-3" /> Save Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading State */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-2xl bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-[#FAF8F2] p-4 rounded-2xl border border-[#E8E1D5] text-xs text-[#77736B] flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-[#C8A97E] border-t-transparent rounded-full animate-spin"></span>
                Processing multimodal payload with Gemini API...
              </div>
            </div>
          )}
        </div>

        {/* Input Box & Action Button */}
        <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-2 pt-3 border-t border-[#E8E1D5]">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              activeTool === 'chat'
                ? 'Ask a question using all selected study materials...'
                : `Enter topic or press Run to execute ${activeTool.toUpperCase()}...`
            }
            className="flex-1 bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl px-4 py-3 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition placeholder:text-[#A49F96]"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-[#C8A97E] hover:bg-[#B8976C] text-white rounded-xl font-bold transition shadow-xs disabled:opacity-40 flex items-center gap-1.5 text-xs"
          >
            <span>{activeTool === 'chat' ? 'Send' : 'Run Tool'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Quiz Modal */}
      {showQuizModal && quizData && (
        <QuizModal quizData={quizData} onClose={() => setShowQuizModal(false)} />
      )}
    </div>
  );
};
