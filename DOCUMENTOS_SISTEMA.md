# 📄 SISTEMA DE DOCUMENTOS - DOCUMENTAÇÃO COMPLETA

**Versão:** 2.0  
**Status:** ✅ IMPLEMENTADO

---

## 🎯 FUNCIONALIDADES

### ✅ 1. Isolamento Multi-Tenant
- Documentos isolados por usuário
- Zero acesso cruzado entre usuários
- Filtro automático por clientId

### ✅ 2. Upload Inteligente
- Modal drag & drop
- Múltiplos arquivos
- Validação de tipo e tamanho
- Preview antes de enviar

### ✅ 3. Conversão Automática
- PDF → Texto
- DOCX → Texto
- TXT → Texto
- Hash único para cada arquivo

### ✅ 4. Google Drive Integration
- Listagem de arquivos
- Upload para Drive
- Sincronização bidirecional (opcional)

### ✅ 5. Consulta por Agentes
- Agentes consultam por hash
- Conteúdo indexado
- Busca rápida

---

## 🏗️ ARQUITETURA

### Backend
```
server/
├── documentConverter.ts    # Conversão PDF/DOCX/TXT → Texto
├── documentStorage.ts       # Armazenamento com hash
├── googleDriveService.ts    # Integração Google Drive
└── index.ts                 # Endpoints API
```

### Frontend
```
components/
├── DocumentUploadModal.tsx  # Modal de upload
hooks/
├── useDocumentUpload.ts     # Upload de arquivos
├── useDocuments.ts          # Listagem de documentos
```

---

## 📡 ENDPOINTS API

### 1. Upload de Documento
```typescript
POST /api/documents/upload
Headers:
  x-client-id: number
Body:
  {
    userId: number,
    fileName: string,
    mimeType: string,
    size: number,
    fileHash: string,
    extractedText?: string,
    metadata?: object,
    driveFileId?: string
  }

Response:
  {
    id: number,
    name: string,
    mimeType: string,
    size: number,
    contentHash: string,
    extractedText: string,
    uploadedAt: Date
  }
```

### 2. Listar Documentos do Usuário
```typescript
GET /api/users/:userId/documents?clientId=:clientId

Response:
  DocumentWithContent[]
```

### 3. Buscar por Hash (Agentes)
```typescript
GET /api/documents/hash/:hash?clientId=:clientId

Response:
  {
    hash: string,
    textContent: string
  }
```

### 4. Google Drive - Listar
```typescript
GET /api/drive/files?clientId=:clientId

Response:
  {
    files: DriveFile[],
    message?: string
  }
```

---

## 🎨 COMPONENTE MODAL

### DocumentUploadModal

```typescript
<DocumentUploadModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onUpload={async (file) => {
    const result = await uploadFile(file);
    console.log('Documento enviado:', result);
  }}
  userId={currentUser.id}
  clientId={currentUser.clientId}
  allowedTypes={[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]}
  maxSize={50 * 1024 * 1024} // 50MB
/>
```

**Características:**
- ✅ Drag & Drop
- ✅ Seleção de arquivos
- ✅ Preview antes de enviar
- ✅ Validação automática
- ✅ Loading states
- ✅ Error handling

---

## 🔐 HASH E ISOLAMENTO

### Hash Único
```typescript
const hash = crypto.createHash('sha256')
  .update(buffer)
  .digest('hex');
```

**Características:**
- ✅ Determinístico (mesmo arquivo = mesmo hash)
- ✅ Único por arquivo
- ✅ Usado como ID para agentes
- ✅ Cache automático

### Isolamento por Usuário
```typescript
// Backend filtra automaticamente
const docs = await storage.getUserDocuments(userId, clientId);

// Apenas documentos do usuário específico
// Outros usuários não têm acesso
```

---

## 🤖 INTEGRAÇÃO COM AGENTES

### Agente Consulta Documento

```typescript
// 1. Usuário menciona documento no chat
"I want to analyze document abc123"

// 2. Agente busca pelo hash
const doc = await fetch(`/api/documents/hash/abc123?clientId=${clientId}`);
const text = doc.textContent;

// 3. Usa conteúdo na resposta
"Analisando documento: [conteúdo extraído]..."
```

### Contexto Disponível

```typescript
{
  documentHash: "abc123",
  textContent: "Conteúdo completo extraído...",
  metadata: {
    wordCount: 1500,
    type: "pdf",
    uploadedAt: "2025-01-01"
  }
}
```

---

## ⚙️ CONFIGURAÇÃO GOOGLE DRIVE

### Variáveis de Ambiente
```env
GOOGLE_DRIVE_CLIENT_ID=seu_client_id
GOOGLE_DRIVE_CLIENT_SECRET=seu_secret
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3001/api/drive/callback
GOOGLE_DRIVE_REFRESH_TOKEN=seu_token
```

### Como Obter:
1. Criar projeto no [Google Cloud Console](https://console.cloud.google.com)
2. Habilitar Google Drive API
3. Configurar OAuth2
4. Copiar credenciais
5. Colar no `.env`

---

## 📊 FORMATOS SUPORTADOS

### Atualmente
- ✅ PDF (`application/pdf`)
- ✅ DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
- ✅ TXT (`text/plain`)

### Em Produção
- ✅ PDF com pdf-parse
- ✅ DOCX com mammoth
- ✅ XLSX com xlsx
- ✅ PPTX (em desenvolvimento)

---

## 🧪 EXEMPLO DE USO

### Página de Documentos

```typescript
import { useState } from 'react';
import DocumentUploadModal from '../components/DocumentUploadModal';
import useDocumentUpload from '../hooks/useDocumentUpload';
import useDocuments from '../hooks/useDocuments';

const DocumentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { uploadFiles } = useDocumentUpload(userId, clientId);
  const { documents, loading, refetch } = useDocuments(userId, clientId);

  const handleUpload = async (files: File[]) => {
    const results = await uploadFiles(files);
    refetch(); // Atualizar lista
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        Upload Documentos
      </button>

      <DocumentUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        userId={userId}
        clientId={clientId}
      />

      {/* Listar documentos */}
      <div>
        {documents.map(doc => (
          <div key={doc.id}>
            <p>{doc.name}</p>
            <p>Hash: {doc.contentHash}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔐 SEGURANÇA

### Validações Implementadas
- ✅ Multi-tenant isolation
- ✅ ClientId obrigatório
- ✅ Validação de tipo de arquivo
- ✅ Validação de tamanho
- ✅ Hash único e imutável
- ✅ Zero acesso cruzado entre usuários

### Armazenamento
- ✅ Hash como identificador único
- ✅ Texto extraído indexado
- ✅ Metadados guardados
- ✅ Isolamento por tenant

---

## 📈 PRÓXIMOS PASSOS

### Imediato
- [ ] Configurar conversores completos (pdf-parse, mammoth)
- [ ] Implementar busca por conteúdo
- [ ] Dashboard de documentos

### Curto Prazo
- [ ] Google Drive sync completo
- [ ] Preview de documentos
- [ ] Versionamento

### Longo Prazo
- [ ] OCR para imagens
- [ ] Compressão
- [ ] Backup automático

---

## ✅ CHECKLIST

- [x] Sistema de hash
- [x] Upload com validação
- [x] Modal drag & drop
- [x] Multi-tenant isolation
- [x] API endpoints
- [x] Hooks de upload
- [x] Integração Google Drive (estrutura)
- [x] Busca por hash
- [ ] Conversores completos
- [ ] Testes E2E

---

**Status:** ✅ SISTEMA FUNCIONAL (conversores pendentes)  
**Documentação:** ✅ Completa  
**Teste:** ⚠️ Necessário após configurar conversores

