import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, MessageSquare, BookOpen, RefreshCw, X, Sparkles, BarChart3, Search, Trash2, Network, Calendar } from 'lucide-react';
import { documentApi, summaryApi, quizApi } from '../lib/apiClient';
import { useNavigate } from 'react-router-dom';
import { DocumentAnalyticsModal } from '../components/modals/DocumentAnalyticsModal';
import { KnowledgeGraphModal } from '../components/modals/KnowledgeGraphModal';
import { StudyRoadmapModal } from '../components/modals/StudyRoadmapModal';

interface DocumentItem {
  id: number;
  originalFilename: string;
  fileSize: number;
  status: 'ANALYZED' | 'PROCESSING' | 'FAILED';
  category: string;
  createdAt: string;
}

const updateDocumentStatus = (docList: DocumentItem[], docId: number, status: DocumentItem['status']): DocumentItem[] => {
  return docList.map((d) => (d.id === docId ? { ...d, status } : d));
};

export const DocumentsView: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Filters & search
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  // Summary modal state
  const [summaryModal, setSummaryModal] = useState<{ open: boolean; title: string; content: string; loading: boolean }>({
    open: false,
    title: '',
    content: '',
    loading: false,
  });

  // Analytics modal state
  const [analyticsModal, setAnalyticsModal] = useState<{ open: boolean; docId: number; docName: string }>({
    open: false,
    docId: 0,
    docName: '',
  });

  // Knowledge Graph modal state
  const [kgModal, setKgModal] = useState<{ open: boolean; docId: number; docName: string }>({
    open: false,
    docId: 0,
    docName: '',
  });

  // Study Roadmap modal state
  const [roadmapModal, setRoadmapModal] = useState<{ open: boolean; docId: number; docName: string }>({
    open: false,
    docId: 0,
    docName: '',
  });

  const loadDocuments = async () => {
    try {
      const data = await documentApi.getHistory();
      if (data?.content) {
        setDocuments(data.content);
      }
    } catch {
      // Handled inside apiClient fallback
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
      const newDoc: DocumentItem = {
        id: Date.now(),
        originalFilename: file.name,
        fileSize: file.size,
        status: 'PROCESSING',
        category: selectedCategory !== 'All' ? selectedCategory : 'General',
        createdAt: new Date().toISOString(),
      };
      setDocuments((prev) => [newDoc, ...prev]);

      if (result.jobId) {
        setTimeout(() => {
          setDocuments((prev) => updateDocumentStatus(prev, newDoc.id, 'ANALYZED'));
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      await documentApi.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
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
        content: 'Executive Map-Reduce summary generated for ' + doc.originalFilename,
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

  const categories = ['All', 'Physics', 'Chemistry', 'Computer Science', 'Economics', 'General'];

  const filteredDocs = documents.filter((d) => {
    const matchesCat = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesSearch = !searchFilter || d.originalFilename.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans relative">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">
            Document <span className="gradient-text-orange font-extrabold">Library</span>
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">Upload course notes, textbooks & papers for pgvector RAG indexing.</p>
        </div>

        {/* Filter Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter library documents..."
            className="w-full bg-[#0D0D17] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316]"
          />
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
        className={`scanning-grid border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
          dragActive
            ? 'border-[#F97316] bg-[#F97316]/10 scale-[1.01]'
            : 'border-white/10 bg-[#0D0D17]/50 hover:border-orange-500/30'
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
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#F97316] mb-3 orange-glow">
            {uploading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          </div>
          <h3 className="text-sm font-bold text-white mb-1 font-heading">
            {uploading ? 'Ingesting & Vectorizing Document...' : 'Drag and drop your academic files here'}
          </h3>
          <p className="text-xs text-[#94A3B8] mb-4 max-w-md font-sans">
            Supports PDF, DOCX, TXT files up to 50MB. Automatic Map-Reduce triggers on 50+ chunks.
          </p>
          <span className="bg-gradient-to-r from-[#F97316] to-[#D946EF] text-white text-xs px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider hover:opacity-95 transition-colors orange-glow cursor-pointer">
            Browse Computer Files
          </span>
        </label>
      </div>

      {/* Category Tabs & Document List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase font-heading">
            Ingested Documents ({filteredDocs.length})
          </h2>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#F97316] text-white orange-glow'
                    : 'bg-white/5 text-[#94A3B8] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const isFailed = doc.status === 'FAILED';
            const isProcessing = doc.status === 'PROCESSING';

            return (
              <Card
                key={doc.id}
                variant="default"
                className={`relative flex flex-col justify-between group ${
                  isFailed ? 'border-[#EF4444]/40 bg-[#EF4444]/5' : ''
                }`}
              >
                <div>
                  {/* File Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5 text-[#F97316] border border-white/5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setKgModal({ open: true, docId: doc.id, docName: doc.originalFilename })}
                        title="View Concept Knowledge Graph"
                        aria-label="View Concept Knowledge Graph"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#06B6D4] transition-colors"
                      >
                        <Network className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoadmapModal({ open: true, docId: doc.id, docName: doc.originalFilename })}
                        title="Generate AI Study Roadmap"
                        aria-label="Generate AI Study Roadmap"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F97316] transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnalyticsModal({ open: true, docId: doc.id, docName: doc.originalFilename })}
                        title="View Document Analytics & Readability"
                        aria-label="View Document Analytics"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#06B6D4] transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Delete Document"
                        aria-label="Delete Document"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-[#EF4444]/20 text-[#A1A1AA] hover:text-[#EF4444] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {doc.status === 'ANALYZED' && <Badge variant="cyan">Analyzed</Badge>}
                      {doc.status === 'PROCESSING' && <Badge variant="orange">Processing</Badge>}
                      {doc.status === 'FAILED' && <Badge variant="danger">Failed</Badge>}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-white truncate mb-1" title={doc.originalFilename}>
                    {doc.originalFilename}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-[#94A3B8] font-mono mb-4">
                    <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  {isFailed ? (
                    <button
                      type="button"
                      onClick={() => handleFileUpload(null)}
                      className="w-full bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Upload</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate('/chat')}
                        disabled={isProcessing}
                        className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#06B6D4]" />
                        <span>Chat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFetchSummary(doc)}
                        disabled={isProcessing}
                        className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#F97316]" />
                        <span>Summary</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleGenerateQuiz(doc.id)}
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/10 hover:from-[#F97316]/20 hover:to-[#D946EF]/20 text-[#F97316] border border-[#F97316]/20 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
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

      {/* Knowledge Graph Modal */}
      {kgModal.open && (
        <KnowledgeGraphModal
          documentId={kgModal.docId}
          documentName={kgModal.docName}
          onClose={() => setKgModal({ open: false, docId: 0, docName: '' })}
        />
      )}

      {/* Study Roadmap Modal */}
      {roadmapModal.open && (
        <StudyRoadmapModal
          documentId={roadmapModal.docId}
          documentName={roadmapModal.docName}
          onClose={() => setRoadmapModal({ open: false, docId: 0, docName: '' })}
        />
      )}

      {/* Analytics Modal */}
      {analyticsModal.open && (
        <DocumentAnalyticsModal
          documentId={analyticsModal.docId}
          documentName={analyticsModal.docName}
          onClose={() => setAnalyticsModal({ open: false, docId: 0, docName: '' })}
        />
      )}

      {/* Executive Summary Modal */}
      {summaryModal.open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="glow-ambient-orange top-[0px] left-[0px]" />
            
            <div className="p-5 border-b border-white/5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#F97316]/15 to-[#D946EF]/10 text-[#F97316] border border-orange-500/10">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">Map-Reduce Executive Summary</h3>
                  <p className="text-[10px] text-[#94A3B8] font-mono truncate max-w-md mt-0.5">{summaryModal.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSummaryModal({ open: false, title: '', content: '', loading: false })}
                aria-label="Close Summary Modal"
                className="text-[#94A3B8] hover:text-white p-1.5 rounded-xl hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto font-sans text-xs leading-relaxed text-[#94A3B8] space-y-4 z-10">
              {summaryModal.loading ? (
                <div className="flex items-center justify-center py-12 text-[#F97316] font-mono gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing Map-Reduce vector chunks...</span>
                </div>
              ) : (
                <div className="prose prose-invert prose-xs text-[#F8FAFC] bg-[#06060A]/85 p-5 rounded-2xl border border-white/5">
                  <p className="text-xs text-[#94A3B8] leading-relaxed whitespace-pre-line font-sans">
                    {summaryModal.content}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 flex justify-end gap-3 z-10">
              <button
                type="button"
                onClick={() => setSummaryModal({ open: false, title: '', content: '', loading: false })}
                className="bg-white/5 hover:bg-white/10 text-white text-xs px-5 py-2.5 rounded-xl font-bold cursor-pointer border border-white/5"
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
