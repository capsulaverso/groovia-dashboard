import { useState, useEffect } from 'react';
import { apiClient } from './useApi';
import type { Document as DbDocument } from '../shared/schema';

export interface DocumentWithContent extends DbDocument {
  contentHash?: string;
  extractedText?: string;
}

export const useDocuments = (userId: number, clientId: number) => {
  const [documents, setDocuments] = useState<DocumentWithContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const docs = await apiClient.get<DocumentWithContent[]>(`/users/${userId}/documents?clientId=${clientId}`);
        setDocuments(docs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar documentos');
      } finally {
        setLoading(false);
      }
    };

    if (userId && clientId) {
      fetchDocuments();
    }
  }, [userId, clientId]);

  const deleteDocument = async (docId: number) => {
    try {
      await apiClient.delete(`/documents/${docId}?clientId=${clientId}`);
      setDocuments(docs => docs.filter(d => d.id !== docId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar documento');
      throw err;
    }
  };

  const getDocumentByHash = async (hash: string) => {
    try {
      const doc = await apiClient.get<{ hash: string; textContent?: string }>(`/documents/hash/${hash}?clientId=${clientId}`);
      return doc;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar documento');
      throw err;
    }
  };

  return {
    documents,
    loading,
    error,
    deleteDocument,
    getDocumentByHash,
    refetch: () => {
      setLoading(true);
      const fetchDocuments = async () => {
        try {
          const docs = await apiClient.get<DocumentWithContent[]>(`/users/${userId}/documents?clientId=${clientId}`);
          setDocuments(docs);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao buscar documentos');
        } finally {
          setLoading(false);
        }
      };
      fetchDocuments();
    }
  };
};

export default useDocuments;

