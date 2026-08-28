import React, { useState, useEffect } from 'react';
import API from '../api/axiosClient';
import {
  BookmarkCheck,
  Trash2,
  FileText,
  HelpCircle,
  Brain,
  FileCheck,
  Calendar,
  Sparkles,
  Search,
} from 'lucide-react';

export const SavedNotesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchSavedItems = async () => {
    try {
      const res = await API.get('/ai/saved');
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching saved items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saved study item?')) return;
    try {
      await API.delete(`/ai/saved/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof item.content === 'string' && item.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 text-left animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#2D2B2A] flex items-center gap-2.5">
          <BookmarkCheck className="w-7 h-7 text-[#C8A97E]" /> Saved Study Notes & Quizzes
        </h1>
        <p className="text-sm text-[#77736B] mt-1">
          Review saved AI responses, generated flashcards, executive summaries, and MCQ quizzes.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 sm:w-72">
          <Search className="w-4 h-4 text-[#A49F96] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved notes..."
            className="w-full bg-[#FFFFFF] border border-[#E8E1D5] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition placeholder:text-[#A49F96]"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-xl border border-[#E8E1D5]">
          {['all', 'notes', 'mcq', 'summary'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                filterType === t ? 'bg-[#C8A97E] text-white' : 'text-[#77736B] hover:text-[#2D2B2A]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#77736B] animate-pulse">Loading saved items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-[#FFFFFF] rounded-3xl border border-[#E8E1D5]">
          <BookmarkCheck className="w-10 h-10 text-[#A49F96] mx-auto" />
          <p className="text-sm font-bold text-[#77736B]">No saved notes or quizzes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#C8A97E] rounded-3xl p-5 shadow-xs transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5]">
                    {item.type}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-[#77736B]">
                    <Calendar className="w-3.5 h-3.5 text-[#A49F96]" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#2D2B2A]">{item.title}</h3>

                <div className="bg-[#FAF8F2] border border-[#E8E1D5] rounded-2xl p-3.5 text-xs text-[#2D2B2A] font-mono leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2)}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleDelete(item._id)}
                  className="px-3 py-1.5 text-xs font-bold text-[#77736B] hover:text-[#C5A0A0] hover:bg-[#F5F1E8] rounded-xl border border-[#E8E1D5] transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
