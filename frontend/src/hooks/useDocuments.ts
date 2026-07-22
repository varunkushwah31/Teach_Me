import { useState, useEffect, useCallback } from 'react';
import { documentApi, summaryApi } from '../lib/apiClient';

export interface DocumentItem {
  id: number;
  originalFilename: string;
  fileSize: number;
  status: 'ANALYZED' | 'PROCESSING' | 'FAILED';
  category: string;
  createdAt: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentApi.getHistory();
      if (data && data.content) {
        setDocuments(data.content);
      }
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const result = await documentApi.upload(file);
      const newDoc: DocumentItem = {
        id: Date.now(),
        originalFilename: file.name,
        fileSize: file.size,
        status: 'PROCESSING',
        category: 'General',
        createdAt: new Date().toISOString(),
      };
      setDocuments((prev) => [newDoc, ...prev]);

      if (result.jobId) {
        setTimeout(() => {
          setDocuments((prev) =>
            prev.map((d) => (d.id === newDoc.id ? { ...d, status: 'ANALYZED' } : d))
          );
        }, 3000);
      }
      return result;
    } catch (err) {
      console.error('Upload failed', err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const getSummary = useCallback(async (docId: number) => {
    return await summaryApi.get(docId);
  }, []);

  return {
    documents,
    loading,
    uploading,
    fetchDocuments,
    uploadDocument,
    getSummary,
  };
}
