import React from 'react';
import { X, FileText, Image as ImageIcon, Music, HardDrive, Calendar } from 'lucide-react';
import { BACKEND_URL } from '../api/axiosClient';

export const MaterialViewModal = ({ material, onClose }) => {
  if (!material) return null;

  const isPdf = material.fileType === 'pdf';
  const isImg = material.fileType === 'image';
  const isAud = material.fileType === 'audio';

  const fileUrl = `${BACKEND_URL}${material.filePath}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2B2A]/30 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-xl relative text-left space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8E1D5] pb-4">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5]">
                {material.fileType}
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#A8B5A2]/15 text-[#4A5D44] border border-[#A8B5A2]/30 uppercase">
                {material.processingStatus || 'completed'}
              </span>
            </div>
            <h2 className="text-lg font-black text-[#2D2B2A]">{material.title}</h2>
            <p className="text-xs text-[#77736B]">File: {material.originalName}</p>
          </div>

          <button onClick={onClose} className="p-1.5 text-[#77736B] hover:text-[#2D2B2A] rounded-xl hover:bg-[#FAF8F2] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[250px]">
          {isImg && (
            <div className="rounded-2xl border border-[#E8E1D5] overflow-hidden bg-[#FAF8F2] p-2 flex items-center justify-center">
              <img src={fileUrl} alt={material.title} className="max-h-96 object-contain rounded-xl" />
            </div>
          )}

          {isAud && (
            <div className="p-8 rounded-2xl bg-[#FAF8F2] border border-[#E8E1D5] text-center space-y-4">
              <Music className="w-12 h-12 text-[#C8A97E] mx-auto" />
              <audio controls src={fileUrl} className="w-full max-w-md mx-auto"></audio>
            </div>
          )}

          {isPdf && material.extractedText && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#2D2B2A]">Extracted PDF Text Preview:</h4>
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E8E1D5] text-xs text-[#2D2B2A] font-mono leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {material.extractedText}
              </div>
            </div>
          )}

          {material.description && (
            <div>
              <h4 className="text-xs font-bold text-[#2D2B2A] mb-1">Description:</h4>
              <p className="text-xs text-[#77736B] leading-relaxed">{material.description}</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-[#E8E1D5] flex items-center justify-between text-xs text-[#77736B]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-[#A49F96]" />
              {(material.fileSize / (1024 * 1024)).toFixed(2)} MB
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#A49F96]" />
              {new Date(material.uploadDate || material.createdAt).toLocaleDateString()}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#C8A97E] hover:bg-[#B8976C] text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
