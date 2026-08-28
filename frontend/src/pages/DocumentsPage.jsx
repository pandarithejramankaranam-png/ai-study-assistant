import React, { useState, useEffect } from 'react';
import API from '../api/axiosClient';
import {
  Folder,
  Upload,
  FileText,
  Image as ImageIcon,
  Music,
  Trash2,
  Eye,
  Search,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Calendar,
  BarChart2,
} from 'lucide-react';
import { MaterialViewModal } from '../components/MaterialViewModal';
import { Link } from 'react-router-dom';

export const DocumentsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleFileSelection = (file) => {
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
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
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      setUploadSuccess('Study material uploaded & processed successfully!');
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
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study document?')) return;
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
      (mat.originalName && mat.originalName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (mat.description && mat.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 text-left animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-[#2D2B2A] flex items-center gap-2.5">
          <Folder className="w-7 h-7 text-[#C8A97E]" /> Study Documents Hub
        </h1>
        <p className="text-sm text-[#77736B] mt-1">
          Upload PDF textbooks, JPG/PNG notes, or MP3/WAV voice recordings.
        </p>
      </div>

      {/* Upload Box Card */}
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#2D2B2A] flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#C8A97E]" /> Upload PDF, Image, or Audio File
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="mock-pdf-btn"
              onClick={() => {
                const mockPdf = new File(["%PDF-1.4 sample pdf content for studylens"], "quantum_physics.pdf", { type: "application/pdf" });
                handleFileSelection(mockPdf);
              }}
              className="px-2.5 py-1 text-[11px] font-bold bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] rounded-xl hover:bg-[#C8A97E] hover:text-white transition"
            >
              + Select Mock PDF
            </button>
            <button
              type="button"
              id="mock-img-btn"
              onClick={() => {
                const mockImg = new File(["dummy png content"], "handwritten_formula.png", { type: "image/png" });
                handleFileSelection(mockImg);
              }}
              className="px-2.5 py-1 text-[11px] font-bold bg-[#F5F1E8] text-[#A8B5A2] border border-[#E8E1D5] rounded-xl hover:bg-[#A8B5A2] hover:text-white transition"
            >
              + Select Mock PNG Image
            </button>
            <button
              type="button"
              id="mock-aud-btn"
              onClick={() => {
                const mockAud = new File(["dummy mp3 content"], "lecture_audio.mp3", { type: "audio/mp3" });
                handleFileSelection(mockAud);
              }}
              className="px-2.5 py-1 text-[11px] font-bold bg-[#F5F1E8] text-[#77736B] border border-[#E8E1D5] rounded-xl hover:bg-[#77736B] hover:text-white transition"
            >
              + Select Mock MP3 Audio
            </button>
          </div>
        </div>

        {uploadSuccess && (
          <div className="p-3.5 rounded-xl bg-[#A8B5A2]/15 border border-[#A8B5A2]/40 text-[#4A5D44] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {uploadSuccess}
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#C5A0A0]/15 border border-[#C5A0A0]/40 text-[#8B4242] text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition bg-[#FAF8F2] group ${
              isDragOver ? 'border-[#C8A97E] bg-[#F5F1E8] scale-[1.01]' : 'border-[#E8E1D5] hover:border-[#C8A97E]'
            }`}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.mp3,.wav"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] flex items-center justify-center mx-auto group-hover:scale-105 transition">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#2D2B2A]">
                {selectedFile ? (
                  <span className="text-[#C8A97E] font-bold">{selectedFile.name} ({formatBytes(selectedFile.size)})</span>
                ) : (
                  'Drag and drop PDF, JPG, PNG, MP3, or WAV here, or click to browse'
                )}
              </p>
              <p className="text-xs text-[#77736B]">
                Allowed formats: PDF, JPG, JPEG, PNG, MP3, WAV (Max size 25MB)
              </p>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#77736B]">
                <span>Uploading study material...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#FAF8F2] overflow-hidden border border-[#E8E1D5]">
                <div
                  className="h-full bg-[#C8A97E] transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D2B2A] mb-1">Title / Subject</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 4 Quantum Mechanics"
                className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition placeholder:text-[#A49F96]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2D2B2A] mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Physics, Midterm, Notes"
                className="w-full bg-[#FAF8F2] border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition placeholder:text-[#A49F96]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-6 py-2.5 bg-[#C8A97E] hover:bg-[#B8976C] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-40"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Uploading & Processing...</span>
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

      {/* Documents List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[#2D2B2A] flex items-center gap-2">
            Your Uploaded Documents ({filteredMaterials.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#A49F96] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials..."
                className="w-full bg-[#FFFFFF] border border-[#E8E1D5] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2D2B2A] focus:outline-none focus:border-[#C8A97E] transition placeholder:text-[#A49F96]"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-xl border border-[#E8E1D5]">
              {['all', 'pdf', 'image', 'audio'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition ${
                    filterType === t ? 'bg-[#C8A97E] text-white' : 'text-[#77736B] hover:text-[#2D2B2A]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#77736B] animate-pulse">Loading study materials...</div>
        ) : filteredMaterials.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-[#FFFFFF] rounded-3xl border border-[#E8E1D5]">
            <FileText className="w-10 h-10 text-[#A49F96] mx-auto" />
            <p className="text-sm font-bold text-[#77736B]">No study documents found.</p>
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
                  className="bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#C8A97E] rounded-3xl p-5 shadow-xs transition flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-[#F5F1E8] border border-[#E8E1D5] flex items-center justify-center shrink-0">
                        {isPdf && <FileText className="w-5 h-5 text-[#C5A0A0]" />}
                        {isImg && <ImageIcon className="w-5 h-5 text-[#A8B5A2]" />}
                        {isAud && <Music className="w-5 h-5 text-[#C8A97E]" />}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5]">
                          {mat.fileType}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          mat.processingStatus === 'completed'
                            ? 'bg-[#A8B5A2]/15 text-[#4A5D44] border border-[#A8B5A2]/30'
                            : 'bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5]'
                        }`}>
                          {mat.processingStatus || 'completed'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#2D2B2A] group-hover:text-[#C8A97E] transition truncate">
                        {mat.title}
                      </h3>
                      <p className="text-[11px] text-[#77736B] truncate mt-0.5">
                        File: {mat.originalName}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-[#77736B] font-semibold mt-1">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3 text-[#A49F96]" />
                          {formatBytes(mat.fileSize)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#A49F96]" />
                          {new Date(mat.uploadDate || mat.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {mat.tags && mat.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {mat.tags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF8F2] text-[#77736B] border border-[#E8E1D5]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#E8E1D5] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedMaterial(mat)}
                        className="p-1.5 text-[#77736B] hover:text-[#2D2B2A] rounded-xl hover:bg-[#F5F1E8] transition"
                        title="View Document Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mat._id)}
                        className="p-1.5 text-[#77736B] hover:text-[#C5A0A0] rounded-xl hover:bg-[#F5F1E8] transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link
                      to={`/documents/${mat._id}/analysis`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] hover:bg-[#C8A97E] hover:text-white rounded-xl transition"
                    >
                      <BarChart2 className="w-3.5 h-3.5" /> Analyze
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedMaterial && (
        <MaterialViewModal material={selectedMaterial} onClose={() => setSelectedMaterial(null)} />
      )}
    </div>
  );
};
