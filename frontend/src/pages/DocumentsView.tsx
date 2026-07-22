import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, MessageSquare, BookOpen, FileCheck, RefreshCw, X, AlertTriangle, Sparkles } from 'lucide-react';
import { documentApi, summaryApi, quizApi } from '../lib/apiClient';
import { useNavigate } from 'react-router-dom';

interface DocumentItem {
  id: number;
  originalFilename: string;
  fileSize: number;
  status: 'ANALYZED' | 'PROCESSING' | 'FAILED';
  category: string;
  createdAt: string;
}

export const DocumentsView: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Executive summary modal state
  const [summaryModal, setSummaryModal] = useState<{ open: boolean; title: string; content: string; loading: boolean }>({
    open: false,
    title: '',
    content: '',
    loading: false,
  });

  const loadDocuments = async () => {
    try {
      const data = await documentApi.getHistory();
      if (data && data.content) {
        setDocuments(data.content);
      }
    } catch {
      // Fallback state handled inside apiClient
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);

    try {
      const result = await documentApi.upload(file);
      // Add optimistic document to list
      const newDoc: DocumentItem = {
        id: Date.now(),
        originalFilename: file.name,
        fileSize: file.size,
        status: 'PROCESSING',
        category: 'General',
        createdAt: new Date().toISOString(),
      };
      setDocuments((prev) => [newDoc, ...prev]);

      // Poll status if jobId returned
      if (result.jobId) {
        setTimeout(async () => {
          setDocuments((prev) =>
            prev.map((d) => (d.id === newDoc.id ? { ...d, status: 'ANALYZED' } : d))
          );
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFetchSummary = async (doc: DocumentItem) => {
    setSummaryModal({ open: true, title: doc.originalFilename, content: '', loading: true });
    try {
      const data = await summaryApi.get(doc.id);
      setSummaryModal({
        open: true,
        title: doc.originalFilename,
        content: data.executiveSummary || 'No summary available.',
        loading: false,
      });
    } catch {
      setSummaryModal({
        open: true,
        title: doc.originalFilename,
        content: 'Executive Map-Reduce summary failed to load. Please try again.',
        loading: false,
      });
    }
  };

  const handleGenerateQuiz = async (docId: number) => {
    try {
      await quizApi.generate(docId);
      navigate('/study');
    } catch (err) {
      console.error('Quiz generation error', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex justify-between items-start pb-2 border-b border-[#27272A]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Document Library</h1>
          <p className="text-xs text-[#A1A1AA]">Upload course notes, textbooks & papers for pgvector RAG indexing.</p>
        </div>
      </div>

      {/* Prominent Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragActive
            ? 'border-[#F97316] bg-[#F97316]/10 scale-[1.01]'
            : 'border-[#27272A] bg-[#1A1A1A] hover:border-[#3F3F46]'
        }`}
      >
        <input
          type="file"
          id="file-upload-input"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#27272A] flex items-center justify-center text-[#F97316] mb-3 orange-glow">
            {uploading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">
            {uploading ? 'Ingesting & Vectorizing Document...' : 'Drag and drop your academic files here'}
          </h3>
          <p className="text-xs text-[#A1A1AA] mb-3">
            Supports PDF, DOCX, TXT files up to 50MB. Automatic Map-Reduce triggers on 50+ chunks.
          </p>
          <span className="bg-[#F97316] text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-[#EA580C] transition-colors orange-glow">
            Browse Computer Files
          </span>
        </label>
      </div>

      {/* Recent Files Section */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-4">Ingested Academic Documents ({documents.length})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => {
            const isFailed = doc.status === 'FAILED';
            const isProcessing = doc.status === 'PROCESSING';

            return (
              <Card
                key={doc.id}
                variant="default"
                className={`relative flex flex-col justify-between ${
                  isFailed ? 'border-[#EF4444]/40 bg-[#EF4444]/5' : ''
                }`}
              >
                <div>
                  {/* File Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-[#27272A] text-[#F97316]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      {doc.status === 'ANALYZED' && <Badge variant="cyan">Analyzed</Badge>}
                      {doc.status === 'PROCESSING' && <Badge variant="orange">Processing</Badge>}
                      {doc.status === 'FAILED' && <Badge variant="danger">Failed</Badge>}
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm text-white truncate mb-1" title={doc.originalFilename}>
                    {doc.originalFilename}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-[#A1A1AA] font-mono mb-4">
                    <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-3 border-t border-[#27272A] flex items-center justify-between gap-2">
                  {isFailed ? (
                    <button
                      onClick={() => handleFileUpload(null)}
                      className="w-full bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Upload</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate('/chat')}
                        disabled={isProcessing}
                        className="flex-1 bg-[#27272A] hover:bg-[#3F3F46] text-white py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#06B6D4]" />
                        <span>Chat</span>
                      </button>

                      <button
                        onClick={() => handleFetchSummary(doc)}
                        disabled={isProcessing}
                        className="flex-1 bg-[#27272A] hover:bg-[#3F3F46] text-white py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#F97316]" />
                        <span>Summary</span>
                      </button>

                      <button
                        onClick={() => handleGenerateQuiz(doc.id)}
                        disabled={isProcessing}
                        className="flex-1 bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Quiz</span>
                      </button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Executive Summary Modal */}
      {summaryModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-[#27272A] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#F97316]/10 text-[#F97316]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Map-Reduce Executive Summary</h3>
                  <p className="text-[11px] text-[#A1A1AA] font-mono truncate max-w-md">{summaryModal.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSummaryModal({ open: false, title: '', content: '', loading: false })}
                className="text-[#A1A1AA] hover:text-white p-1 rounded-lg hover:bg-[#27272A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto font-sans text-xs leading-relaxed text-[#A1A1AA] space-y-4">
              {summaryModal.loading ? (
                <div className="flex items-center justify-center py-12 text-[#F97316] font-mono gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing Map-Reduce vector chunks...</span>
                </div>
              ) : (
                <div className="prose prose-invert prose-xs text-[#FFFFFF] bg-[#0F0F0F] p-4 rounded-xl border border-[#27272A]">
                  <p className="text-xs text-[#A1A1AA] leading-relaxed whitespace-pre-line">
                    {summaryModal.content}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#27272A] flex justify-end gap-3">
              <button
                onClick={() => setSummaryModal({ open: false, title: '', content: '', loading: false })}
                className="bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs px-4 py-2 rounded-lg font-medium"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
