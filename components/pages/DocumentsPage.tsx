import React, { useState, useEffect } from 'react';
import DocumentUploadModal from '../DocumentUploadModal';
import { useUser } from '../../hooks/useUser';
import useDocuments from '../../hooks/useDocuments';
import { apiClient } from '../../hooks/useApi';

interface DocumentWithTranscription {
    id: number | string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
    retentionDays: number;
    expiresAt: string;
    transcription?: string;
    status: 'pending' | 'transcribed' | 'approved';
}

const DocumentsPage: React.FC = () => {
    const { user } = useUser();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<DocumentWithTranscription | null>(null);
    const [showTranscriptionSidebar, setShowTranscriptionSidebar] = useState(false);
    const [transcriptionText, setTranscriptionText] = useState('');
    const [uploading, setUploading] = useState(false);

    // Usar valores fixos por enquanto para evitar problemas
    const userId = user?.id ? parseInt(user.id) : 1;
    const clientId = user?.clientId || 1;
    
    // Conectar ao banco de dados
    const { documents: dbDocuments, loading, error, deleteDocument, refetch } = useDocuments(userId, clientId);
    const [documents, setDocuments] = useState<DocumentWithTranscription[]>([]);

    // Converter documentos do banco para formato da UI
    useEffect(() => {
        const converted = dbDocuments.map(doc => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            size: formatFileSize(doc.size || 0),
            uploadDate: doc.uploadDate.toISOString(),
            retentionDays: doc.retentionDays || 365,
            expiresAt: new Date(Date.now() + (doc.retentionDays || 365) * 24 * 60 * 60 * 1000).toISOString(),
            transcription: doc.fileUrl || undefined,
            status: 'approved' as const
        }));
        setDocuments(converted);
    }, [dbDocuments]);
    
    // Upload que salva no banco
    const handleSimpleUpload = async (file: File) => {
        try {
            setUploading(true);
            
            // Simular transcrição
            const transcription = `[Conteúdo extraído do arquivo: ${file.name}]\n\nEste é um exemplo de transcrição. Em produção, o conteúdo real do arquivo seria extraído automaticamente.`;
            
            // Salvar no banco
            const savedDoc = await apiClient.post('/documents', {
                clientId,
                userId,
                name: file.name,
                type: file.type,
                size: file.size,
                retentionDays: 90,
                isPrivate: false,
                fileUrl: transcription
            });
            
            // Criar documento para UI
            const newDoc: DocumentWithTranscription = {
                id: savedDoc.id,
                name: file.name,
                type: file.type,
                size: formatFileSize(file.size),
                uploadDate: new Date().toISOString(),
                retentionDays: 90,
                expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                transcription: transcription,
                status: 'pending'
            };

            // Atualizar lista
            setDocuments(prev => [...prev, newDoc]);
            setShowUploadModal(false);
            
            // Mostrar sidebar
            setSelectedDoc(newDoc);
            setTranscriptionText(transcription);
            setShowTranscriptionSidebar(true);
            setUploading(false);
            
            // Recarregar do banco
            refetch();
        } catch (error) {
            console.error('Erro:', error);
            setUploading(false);
            alert('Erro ao fazer upload');
        }
    };

    const handleUploadClick = () => {
        setShowUploadModal(true);
    };


    const handleApprove = async (doc: DocumentWithTranscription) => {
        try {
            // Salvar no banco de dados através da API
            // O documento já foi salvo no upload, apenas mudar status
            setDocuments(prev => prev.map(d => 
                d.id === doc.id ? { ...d, status: 'approved' as const } : d
            ));
            
            // Fechar sidebar
            setShowTranscriptionSidebar(false);
            setSelectedDoc(null);
            
            // Feedback ao usuário
            console.log('Documento aprovado e salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao aprovar documento:', error);
            alert('Erro ao salvar documento. Tente novamente.');
        }
    };

    const handleReject = async () => {
        try {
            // Deletar documento do banco se necessário
            if (selectedDoc) {
                // TODO: Chamar API para deletar documento
                setDocuments(prev => prev.filter(d => d.id !== selectedDoc.id));
            }
            setShowTranscriptionSidebar(false);
            setSelectedDoc(null);
        } catch (error) {
            console.error('Erro ao cancelar documento:', error);
        }
    };

    const handleDelete = async (id: number | string) => {
        if (confirm('Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.')) {
            try {
                await deleteDocument(typeof id === 'number' ? id : parseInt(id.toString()));
                setDocuments(docs => docs.filter(d => d.id !== id));
            } catch (error) {
                alert('Erro ao excluir documento');
            }
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'pdf': return 'picture_as_pdf';
            case 'excel': return 'table_chart';
            case 'word': return 'description';
            default: return 'insert_drive_file';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const handleViewTranscription = (doc: DocumentWithTranscription) => {
        setSelectedDoc(doc);
        setTranscriptionText(doc.transcription || 'Sem transcrição disponível');
        setShowTranscriptionSidebar(true);
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-200px)]">
            {/* Área Principal */}
            <div className={`flex-1 ${showTranscriptionSidebar ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
                <div className="space-y-6 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-title font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                                Meus Documentos
                            </h1>
                            <p className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                Gerencie seus documentos e revise transcrições
                            </p>
                        </div>
                        <button 
                            onClick={handleUploadClick}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                        >
                            <span className="material-icons-outlined">upload_file</span>
                            <span className="font-medium">Upload</span>
                        </button>
                    </div>

                    {/* Aviso LGPD */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-icons-outlined text-yellow-600 dark:text-yellow-500">info</span>
                            <div className="flex-1">
                                <h3 className="font-semibold text-body text-yellow-800 dark:text-yellow-200 mb-1">
                                    Política de Privacidade
                                </h3>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 text-body">
                                    Seus documentos serão armazenados com segurança e podem ser excluídos a qualquer momento.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-4 text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                    Carregando documentos...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-2xl border border-red-200 dark:border-red-700 flex items-center justify-center">
                            <div className="text-center text-red-500">
                                <span className="material-icons-outlined text-6xl mb-4">error</span>
                                <p className="text-title font-semibold">Erro ao carregar documentos</p>
                                <p className="text-body mt-2">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Lista de Documentos */}
                    {!loading && !error && (
                        <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-y-auto h-full">
                                <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                            Documento
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                            Tamanho
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                            Upload
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {documents.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <span className="material-icons-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4 block">folder_open</span>
                                                <h3 className="text-title font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                                                    Nenhum documento ainda
                                                </h3>
                                                <p className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-4">
                                                    Faça upload do seu primeiro documento para começar
                                                </p>
                                                <button
                                                    onClick={handleUploadClick}
                                                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
                                                >
                                                    <span className="material-icons-outlined">upload_file</span>
                                                    <span className="font-medium">Upload Agora</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ) : (
                                        documents.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                                        doc.status === 'approved' 
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                            : doc.status === 'transcribed'
                                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                    }`}>
                                                        <span className="material-icons-outlined text-xs">
                                                            {doc.status === 'approved' ? 'check_circle' : doc.status === 'transcribed' ? 'auto_awesome' : 'schedule'}
                                                        </span>
                                                        {doc.status === 'approved' ? 'Aprovado' : doc.status === 'transcribed' ? 'Transcrito' : 'Pendente'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-icons-outlined text-primary text-2xl">
                                                            {getTypeIcon(doc.type)}
                                                        </span>
                                                        <div>
                                                            <div className="font-medium text-on-surface-light dark:text-on-surface-dark text-body">
                                                                {doc.name}
                                                            </div>
                                                            <div className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                                                {doc.type}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                                    {doc.size}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                                    {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {doc.transcription && (
                                                            <button
                                                                onClick={() => handleViewTranscription(doc)}
                                                                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                                title="Ver transcrição"
                                                            >
                                                                <span className="material-icons-outlined text-blue-600 dark:text-blue-400">description</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                            title="Baixar"
                                                        >
                                                            <span className="material-icons-outlined text-gray-600 dark:text-gray-400">download</span>
                                                        </button>
                                        <button
                                            onClick={() => handleDelete(typeof doc.id === 'string' ? doc.id : doc.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Excluir"
                                        >
                                            <span className="material-icons-outlined text-red-600 dark:text-red-400">delete</span>
                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    )}
                </div>
            </div>

            {/* Sidebar de Transcrição */}
            {showTranscriptionSidebar && selectedDoc && (
                <div className="w-1/3 bg-surface-light dark:bg-surface-dark border-l border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-title font-semibold text-on-surface-light dark:text-on-surface-dark">
                            Transcrição do Documento
                        </h3>
                        <button
                            onClick={() => setShowTranscriptionSidebar(false)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <span className="material-icons-outlined">close</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-1">
                                    Arquivo
                                </div>
                                <div className="text-body text-on-surface-light dark:text-on-surface-dark font-medium">
                                    {selectedDoc.name}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-1">
                                    Transcrição
                                </div>
                                <div className="text-body text-on-surface-light dark:text-on-surface-dark whitespace-pre-wrap">
                                    {transcriptionText}
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedDoc.status === 'pending' && (
                        <div className="space-y-3">
                            <button
                                onClick={() => handleApprove(selectedDoc)}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-semibold"
                            >
                                <span className="material-icons-outlined">check_circle</span>
                                Aprovar e Salvar
                            </button>
                            <button
                                onClick={handleReject}
                                className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-on-surface-light dark:text-on-surface-dark px-6 py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                            >
                                <span className="material-icons-outlined">cancel</span>
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Upload */}
            <DocumentUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUpload={handleSimpleUpload}
                userId={userId}
                clientId={clientId}
            />
        </div>
    );
};

export default DocumentsPage;
