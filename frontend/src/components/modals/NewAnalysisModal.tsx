import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { X, Upload, FileText, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { documentApi } from '../../lib/apiClient';

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewAnalysisModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('Physics');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await documentApi.upload(file);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card variant="default" className="max-w-lg w-full p-6 space-y-6 relative border-[#F97316]/40 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close New Analysis Modal"
          className="absolute top-4 right-4 p-1.5 text-[#A1A1AA] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-[#27272A]">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F97316]/20 to-[#D946EF]/20 text-[#F97316] orange-glow">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Start New Academic Analysis</h2>
            <p className="text-xs text-[#A1A1AA]">Ingest PDFs into pgvector for RAG chat, Map-Reduce, & quizzes.</p>
          </div>
        </div>

        {/* Category Selector */}
        <div className="space-y-1.5">
          <label htmlFor="modal-category-select" className="block text-xs font-semibold text-[#A1A1AA] uppercase font-mono">Academic Subject Category</label>
          <select
            id="modal-category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#F97316]"
          >
            <option value="Physics">Quantum Physics & Science</option>
            <option value="Computer Science">Computer Science & Algorithms</option>
            <option value="Mathematics">Mathematics & Engineering</option>
            <option value="Biology">Biology & Medicine</option>
            <option value="General">General Academic Notes</option>
          </select>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) {
              setFile(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive ? 'border-[#F97316] bg-[#F97316]/10' : 'border-[#27272A] bg-[#0F0F0F]'
          }`}
        >
          <input
            type="file"
            id="modal-file-upload"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
          />
          <label htmlFor="modal-file-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#27272A] flex items-center justify-center text-[#F97316] mb-3 orange-glow">
              <Upload className="w-5 h-5" />
            </div>
            {file ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#06B6D4]" />
                  {file.name}
                </p>
                <p className="text-[10px] text-[#A1A1AA] font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold text-white mb-1">Click to select PDF or drag file here</p>
                <p className="text-[10px] text-[#A1A1AA]">Supports PDF, DOCX, TXT up to 50MB</p>
              </>
            )}
          </label>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[#27272A]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs rounded-xl font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-5 py-2 bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white text-xs font-bold rounded-xl orange-glow disabled:opacity-40 flex items-center gap-2"
          >
            {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            <span>{uploading ? 'Ingesting Vector Chunks...' : 'Start Analysis'}</span>
          </button>
        </div>
      </Card>
    </div>
  );
};
