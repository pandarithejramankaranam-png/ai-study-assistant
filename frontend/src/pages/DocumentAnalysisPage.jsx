import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axiosClient';
import {
  FileText,
  Sparkles,
  HelpCircle,
  Brain,
  FileCheck,
  ArrowLeft,
  Bot,
  Copy,
  Check,
  HardDrive,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { MaterialViewModal } from '../components/MaterialViewModal';

export const DocumentAnalysisPage = () => {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('summary');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const res = await API.get(`/materials/${id}`);
        setMaterial(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load study document.');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id]);

  const handleRunAnalysis = async (tool) => {
    setActiveTab(tool);
    setAiLoading(true);
    setAiResult('');

    try {
      let endpoint = '/ai/summarize';
      let payload = { materialIds: [id], length: 'medium' };

      if (tool === 'explain') {
        endpoint = '/ai/explain';
        payload = { topic: material.title, materialIds: [id], depth: 'detailed' };
      } else if (tool === 'exam') {
        endpoint = '/ai/generate-questions';
        payload = { topic: material.title, materialIds: [id], count: 5 };
      } else if (tool === 'notes') {
        endpoint = '/ai/generate-notes';
        payload = { topic: material.title, materialIds: [id], format: 'summary' };
      }

      const res = await API.post(endpoint, payload);

      if (res.data.summary) setAiResult(res.data.summary);
      else if (res.data.explanation) setAiResult(res.data.explanation);
      else if (res.data.questionsContent) setAiResult(res.data.questionsContent);
      else if (res.data.notes) setAiResult(typeof res.data.notes === 'string' ? res.data.notes : JSON.stringify(res.data.notes, null, 2));
    } catch (err) {
      console.error('Analysis error:', err);
      setAiResult('Error generating analysis. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (material) {
      handleRunAnalysis('summary');
    }
  }, [material]);

  const handleCopy = () => {
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#77736B] animate-pulse">Loading document analysis...</div>;
  }

  if (error || !material) {
    return (
      <div className="py-12 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-[#C5A0A0] mx-auto" />
        <h2 className="text-base font-bold text-[#2D2B2A]">{error || 'Document not found'}</h2>
        <Link to="/documents" className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8A97E] text-white text-xs font-bold rounded-xl">
          <ArrowLeft className="w-4 h-4" /> Back to Documents
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/documents" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#77736B] hover:text-[#2D2B2A] transition">
          <ArrowLeft className="w-4 h-4 text-[#C8A97E]" /> Back to Documents
        </Link>

        <button
          onClick={() => setShowViewModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#FFFFFF] border border-[#E8E1D5] hover:bg-[#F5F1E8] text-[#2D2B2A] rounded-xl transition"
        >
          <Eye className="w-4 h-4 text-[#C8A97E]" /> Preview Full File
        </button>
      </div>

      {/* Material Info Header Card */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="uppercase text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5]">
              {material.fileType}
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#A8B5A2]/15 text-[#4A5D44] border border-[#A8B5A2]/30 uppercase">
              {material.processingStatus || 'completed'}
            </span>
          </div>
          <h1 className="text-xl font-black text-[#2D2B2A]">{material.title}</h1>
          <p className="text-xs text-[#77736B]">Original File: {material.originalName}</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-[#77736B]">
          <span className="flex items-center gap-1">
            <HardDrive className="w-4 h-4 text-[#A49F96]" />
            {(material.fileSize / (1024 * 1024)).toFixed(2)} MB
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-[#A49F96]" />
            {new Date(material.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* AI Analysis Workspace */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-6">
        {/* Tool Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E8E1D5]">
          {[
            { id: 'summary', label: 'Executive Summary', icon: FileText },
            { id: 'explain', label: 'In-Depth Explanation', icon: Bot },
            { id: 'exam', label: 'Predicted Exam Qs', icon: Brain },
            { id: 'notes', label: 'Study Notes & Cheat Sheet', icon: FileCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleRunAnalysis(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  isActive
                    ? 'bg-[#C8A97E] text-white shadow-xs'
                    : 'bg-[#FAF8F2] text-[#77736B] hover:text-[#2D2B2A] border border-[#E8E1D5]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Area */}
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#2D2B2A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C8A97E]" /> AI Generated Analysis
            </h2>

            {aiResult && (
              <button
                onClick={handleCopy}
                className="text-xs font-bold text-[#77736B] hover:text-[#2D2B2A] px-3 py-1 rounded-xl bg-[#FAF8F2] border border-[#E8E1D5] transition flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#A8B5A2]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Content'}
              </button>
            )}
          </div>

          {aiLoading ? (
            <div className="py-12 text-center text-xs text-[#77736B] flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[#C8A97E] border-t-transparent rounded-full animate-spin"></span>
              Generating document analysis with Gemini API...
            </div>
          ) : (
            <div className="bg-[#FAF8F2] border border-[#E8E1D5] rounded-2xl p-6 text-xs text-[#2D2B2A] leading-relaxed font-mono whitespace-pre-wrap">
              {aiResult}
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && (
        <MaterialViewModal material={material} onClose={() => setShowViewModal(false)} />
      )}
    </div>
  );
};
