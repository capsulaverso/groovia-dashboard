import { useState, useCallback } from 'react';
import { apiClient } from './useApi';
import crypto from 'crypto';

export interface UploadedDocument {
  id: number;
  name: string;
  mimeType: string;
  size: number;
  contentHash: string;
  extractedText?: string;
  uploadedAt: Date;
}

export const useDocumentUpload = (userId: number, clientId: number) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular hash do arquivo
  const calculateFileHash = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) {
          reject(new Error('Erro ao ler arquivo'));
          return;
        }

        const buffer = Buffer.from(e.target.result as ArrayBuffer);
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');
        resolve(hash);
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Extrair texto simples (para implementação inicial)
  const extractText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string || '');
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsText(file);
      } else {
        // Para PDF/DOCX, retornar placeholder
        resolve('[Conteúdo extraído - aguardando conversores completos]');
      }
    });
  };

  // Upload de arquivo
  const uploadFile = useCallback(async (file: File): Promise<UploadedDocument> => {
    setUploading(true);
    setError(null);

    try {
      // Calcular hash
      const hash = await calculateFileHash(file);
      
      // Extrair texto
      const extractedText = await extractText(file);
      
      // Converter arquivo para buffer
      const buffer = await file.arrayBuffer();

      // Upload
      const document = await apiClient.post<UploadedDocument>('/documents/upload', {
        userId,
        clientId,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        fileHash: hash,
        extractedText,
        metadata: {
          lastModified: file.lastModified,
          uploadDate: new Date().toISOString()
        }
      });

      return document;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer upload';
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [userId, clientId]);

  // Upload múltiplo
  const uploadFiles = useCallback(async (files: File[]): Promise<UploadedDocument[]> => {
    const results: UploadedDocument[] = [];
    
    for (const file of files) {
      try {
        const result = await uploadFile(file);
        results.push(result);
      } catch (err) {
        console.error(`Erro ao fazer upload de ${file.name}:`, err);
      }
    }

    return results;
  }, [uploadFile]);

  return {
    uploadFile,
    uploadFiles,
    uploading,
    error
  };
};

export default useDocumentUpload;

