import React, { useState, useEffect } from 'react';
import API from '../api/axiosClient';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Music,
  Trash2,
  Eye,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Calendar,
  Filter,
} from 'lucide-react';
import { MaterialViewModal } from '../components/MaterialViewModal';
import { Link } from 'react-router-dom';

export const UploadHub = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMaterials = async () => {
    try {
      const res = await API.get('/materials');
      setMaterials(res.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);

    try {
      await API.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadSuccess('Study material uploaded successfully!');
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setTags('');
      fetchMaterials();
      setTimeout(() => setUploadSuccess(''), 4000);
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) return;
    try {
      await API.delete(`/materials/${id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredMaterials = materials.filter((mat) => {
    const matchesType = filterType === 'all' || mat.fileType === filterType;
    const matchesSearch =
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mat.description && mat.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 text-left animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
          <Upload className="w-7 h-7 text-indigo-400" /> Study Materials Hub
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload PDF textbooks, lecture slides, handwritten notes, or audio recordings for multimodal AI processing.
        </p>
      </div>

      {/* Main Upload Box Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" /> Upload New Material
        </h2>

        {uploadSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {uploadSuccess}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          {/* Dropzone */}
          <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-2xl p-6 text-center transition bg-slate-950/60 group">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a,.ogg,.txt"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {selectedFile ? (
                  <span className="text-indigo-400 font-bold">{selectedFile.name}</span>
                ) : (
                  'Drag and drop file here, or click to browse'
                )}
              </p>
              <p className="text-xs text-slate-500">
                Supports PDFs, Images (JPG, PNG, WEBP), Audio (MP3, WAV, M4A, OGG), and TXT notes (Max 25MB)
              </p>
            </div>
          </div>

          {/* Title and Metadata Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title / Subject Name</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 4 - Quantum Mechanics Notes"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Physics, Midterm, Formulae"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Optional Description</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary or context regarding this file..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-40"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Uploading & Extracting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Upload Material
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Materials List & Manager */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Uploaded Materials ({filteredMaterials.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-500"
              />
            </div>

            {/* Type Filter dropdown */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {['all', 'pdf', 'image', 'audio'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                    filterType === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 animate-pulse">Loading study materials...</div>
        ) : filteredMaterials.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-900/60 rounded-2xl border border-slate-800">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">No study materials found.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your lecture slides or notes above to begin generating AI study guides.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((mat) => {
              const isPdf = mat.fileType === 'pdf';
              const isImg = mat.fileType === 'image';
              const isAud = mat.fileType === 'audio';

              return (
                <div
                  key={mat._id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-xl transition flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {isPdf && <FileText className="w-5 h-5 text-rose-400" />}
                        {isImg && <ImageIcon className="w-5 h-5 text-emerald-400" />}
                        {isAud && <Music className="w-5 h-5 text-purple-400" />}
                        {!isPdf && !isImg && !isAud && <FileText className="w-5 h-5 text-sky-400" />}
                      </div>

                      <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-800">
                        {mat.fileType}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition truncate">
                        {mat.title}
                      </h3>
                      {mat.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-snug">
                          {mat.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata chips */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-slate-600" />
                        {formatBytes(mat.fileSize)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        {new Date(mat.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {mat.tags && mat.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {mat.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedMaterial(mat)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Preview File"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mat._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="Delete Material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link
                      to={`/ai-workspace?materialId=${mat._id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition"
                    >
                      <Sparkles className="w-3 h-3" /> Study with AI
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Material Modal */}
      {selectedMaterial && (
        <MaterialViewModal material={selectedMaterial} onClose={() => setSelectedMaterial(null)} />
      )}
    </div>
  );
};
