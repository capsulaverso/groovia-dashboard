import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { extractTextFromBuffer } from './documentConverter.js';

export interface StoredDocument {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  hash: string;
  extractedText?: string;
  metadata?: Record<string, any>;
  uploadedAt: Date;
  userId: number;
  clientId: number;
  storagePath?: string;
}

// Armazenamento em memória (em produção usar disco/S3)
const documents: Map<string, StoredDocument> = new Map();

export class DocumentStorageService {
  
  // Armazenar documento
  async storeDocument(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    userId: number,
    clientId: number
  ): Promise<StoredDocument> {
    try {
      // Extrair texto e gerar hash
      const { text, hash, metadata } = await extractTextFromBuffer(fileBuffer, mimeType);

      // Criar documento
      const document: StoredDocument = {
        id: crypto.randomUUID(),
        name: fileName,
        mimeType,
        size: fileBuffer.length,
        hash,
        extractedText: text,
        metadata,
        uploadedAt: new Date(),
        userId,
        clientId
      };

      // Armazenar
      documents.set(hash, document);

      // Em produção, salvar em disco ou S3
      const storageDir = path.join(process.cwd(), 'uploads', clientId.toString());
      await fs.mkdir(storageDir, { recursive: true });
      
      const filePath = path.join(storageDir, `${hash}.${this.getExtension(mimeType)}`);
      await fs.writeFile(filePath, fileBuffer);

      document.storagePath = filePath;

      return document;
    } catch (error) {
      throw new Error(`Erro ao armazenar documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Buscar por hash
  async getDocumentByHash(hash: string, clientId: number): Promise<StoredDocument | undefined> {
    const document = documents.get(hash);
    
    if (!document) {
      return undefined;
    }

    // Validar tenant
    if (document.clientId !== clientId) {
      throw new Error('Documento não pertence ao cliente');
    }

    return document;
  }

  // Buscar por ID de documento
  async getDocumentById(docId: string, clientId: number): Promise<StoredDocument | undefined> {
    const doc = Array.from(documents.values()).find(
      d => d.id === docId && d.clientId === clientId
    );
    
    return doc;
  }

  // Listar documentos do usuário
  async listUserDocuments(userId: number, clientId: number): Promise<StoredDocument[]> {
    return Array.from(documents.values()).filter(
      doc => doc.userId === userId && doc.clientId === clientId
    );
  }

  // Deletar documento
  async deleteDocument(docId: string, clientId: number): Promise<boolean> {
    const doc = Array.from(documents.values()).find(
      d => d.id === docId && d.clientId === clientId
    );

    if (!doc) return false;

    // Remover do mapa
    documents.delete(doc.hash);

    // Em produção, remover arquivo do disco/S3
    if (doc.storagePath) {
      try {
        await fs.unlink(doc.storagePath);
      } catch {}
    }

    return true;
  }

  // Buscar conteúdo por hash (para agentes)
  async getTextContent(hash: string, clientId: number): Promise<string | undefined> {
    const doc = await this.getDocumentByHash(hash, clientId);
    return doc?.extractedText;
  }

  // Helper para extensão
  private getExtension(mimeType: string): string {
    const extMap: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt'
    };

    return extMap[mimeType] || 'bin';
  }
}

// Singleton
export const documentStorage = new DocumentStorageService();

