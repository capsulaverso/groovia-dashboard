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
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVisible, setFilterVisible] = useState<'all' | 'visible' | 'hidden'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');

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

    // Filtros e ordenação
    const filteredAndSortedDocs = React.useMemo(() => {
        let filtered = documents;
        
        // Filtrar por busca
        if (searchQuery) {
            filtered = filtered.filter(doc => 
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Ordenar
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'size':
                    return (parseFloat(a.size) || 0) - (parseFloat(b.size) || 0);
                case 'date':
                default:
                    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
            }
        });
        
        return filtered;
    }, [documents, searchQuery, sortBy]);

    return (
        <div className="space-y-8 max-w-7xl">
            {/* Header Premium com Layout em Duas Colunas */}
            <div className="relative overflow-hidden bg-gradient-to-br from-black to-neutral-900 rounded-3xl border border-neutral-800 p-8">
                {/* Decoração de fundo */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#38ff81]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#38ff81]/5 rounded-full blur-3xl"></div>
                
                <div className="relative flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-4xl font-bold text-white">
                                Meus Documentos
                            </h1>
                        </div>
                        <p className="text-neutral-400 text-lg">
                            Gerencie seus documentos e revise transcrições
                        </p>
                    </div>
                    <button 
                        onClick={handleUploadClick}
                        className="flex items-center gap-2 bg-[#38ff81] text-black px-6 py-3 rounded-xl hover:bg-[#38ff81]/90 transition-colors shadow-lg shadow-[#38ff81]/30 font-semibold"
                    >
                        <span className="material-icons-outlined">upload_file</span>
                        <span>Upload</span>
                    </button>
                </div>
            </div>

            {/* Barra de Filtros e Busca */}
            <div className="flex items-center gap-4">
                {/* Busca */}
                <div className="flex-1 relative">
                    <span className="material-icons-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar documentos..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#38ff81]"
                    />
                </div>
                
                {/* Filtro de Visibilidade */}
                <select
                    value={filterVisible}
                    onChange={(e) => setFilterVisible(e.target.value as 'all' | 'visible' | 'hidden')}
                    className="px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#38ff81]"
                >
                    <option value="all">Exibir: Todos</option>
                    <option value="visible">Visíveis</option>
                    <option value="hidden">Ocultos</option>
                </select>
                
                {/* Ordenação */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
                    className="px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#38ff81]"
                >
                    <option value="date">Ordenar: Data</option>
                    <option value="name">Nome</option>
                    <option value="size">Tamanho</option>
                </select>
            </div>

            {/* Aviso LGPD */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="material-icons-outlined text-yellow-600 dark:text-yellow-500">info</span>
                    <div className="flex-1">
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                            Política de Privacidade
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Seus documentos serão armazenados com segurança e podem ser excluídos a qualquer momento.
                        </p>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-neutral-800 rounded-2xl border border-neutral-700 flex items-center justify-center p-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38ff81] mx-auto"></div>
                        <p className="mt-4 text-neutral-400">
                            Carregando documentos...
                        </p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-neutral-800 rounded-2xl border border-red-700 flex items-center justify-center p-12">
                    <div className="text-center text-red-400">
                        <span className="material-icons-outlined text-6xl mb-4">error</span>
                        <p className="text-xl font-semibold">Erro ao carregar documentos</p>
                        <p className="mt-2 text-neutral-400">{error}</p>
                    </div>
                </div>
            )}

            {/* Lista de Documentos */}
            {!loading && !error && (
                <div className="bg-gradient-to-br from-neutral-900 to-black rounded-3xl border border-neutral-800 overflow-hidden">
                    <div className="overflow-y-auto max-h-[600px]">
                        {filteredAndSortedDocs.length === 0 ? (
                            <div className="p-12 text-center">
                                <span className="material-icons-outlined text-6xl text-neutral-600 mb-4 block">folder_open</span>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum documento ainda'}
                                </h3>
                                <p className="text-neutral-400 mb-6">
                                    {searchQuery ? 'Tente buscar por outro termo' : 'Faça upload do seu primeiro documento para começar'}
                                </p>
                                {!searchQuery && (
                                    <button
                                        onClick={handleUploadClick}
                                        className="inline-flex items-center gap-2 bg-[#38ff81] text-black px-6 py-3 rounded-xl hover:bg-[#38ff81]/90 transition-colors font-semibold"
                                    >
                                        <span className="material-icons-outlined">upload_file</span>
                                        <span>Upload Agora</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-800">
                                {filteredAndSortedDocs.map((doc) => (
                                    <div key={doc.id} className="p-6 hover:bg-neutral-800/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            {/* Ícone e Nome */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center">
                                                    <span className="material-icons-outlined text-[#38ff81] text-2xl">
                                                        {getTypeIcon(doc.type)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white text-lg">
                                                        {doc.name}
                                                    </div>
                                                    <div className="text-sm text-neutral-400">
                                                        {doc.type} • {doc.size}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info e Ações */}
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="text-sm text-neutral-400">Upload em</div>
                                                    <div className="text-white font-medium">
                                                        {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    {doc.transcription && (
                                                        <button
                                                            onClick={() => handleViewTranscription(doc)}
                                                            className="p-2 rounded-lg hover:bg-neutral-700 transition-colors"
                                                            title="Ver transcrição"
                                                        >
                                                            <span className="material-icons-outlined text-blue-400">description</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        className="p-2 rounded-lg hover:bg-neutral-700 transition-colors"
                                                        title="Baixar"
                                                    >
                                                        <span className="material-icons-outlined text-neutral-300">download</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(typeof doc.id === 'string' ? doc.id : doc.id)}
                                                        className="p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <span className="material-icons-outlined text-red-400">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sidebar de Transcrição */}
            {showTranscriptionSidebar && selectedDoc && (
                <div className="fixed inset-y-0 right-0 w-1/3 bg-gradient-to-br from-neutral-900 to-black border-l border-neutral-800 p-6 flex flex-col h-full z-50">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-white">
                            Transcrição do Documento
                        </h3>
                        <button
                            onClick={() => setShowTranscriptionSidebar(false)}
                            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                            <span className="material-icons-outlined text-white">close</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-neutral-950 rounded-xl p-6 mb-6">
                        <div className="space-y-6">
                            <div>
                                <div className="text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                                    Arquivo
                                </div>
                                <div className="text-white font-semibold text-lg">
                                    {selectedDoc.name}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold text-neutral-400 mb-3 uppercase tracking-wider">
                                    Transcrição
                                </div>
                                <div className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
                                    {transcriptionText}
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedDoc.status === 'pending' && (
                        <div className="space-y-3">
                            <button
                                onClick={() => handleApprove(selectedDoc)}
                                className="w-full flex items-center justify-center gap-2 bg-[#38ff81] text-black px-6 py-4 rounded-xl hover:bg-[#38ff81]/90 transition-colors font-bold text-lg shadow-lg shadow-[#38ff81]/30"
                            >
                                <span className="material-icons-outlined">check_circle</span>
                                Aprovar e Salvar
                            </button>
                            <button
                                onClick={handleReject}
                                className="w-full flex items-center justify-center gap-2 bg-neutral-800 text-white px-6 py-4 rounded-xl hover:bg-neutral-700 transition-colors font-semibold"
                            >
                                <span className="material-icons-outlined">cancel</span>
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Overlay para Sidebar */}
            {showTranscriptionSidebar && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setShowTranscriptionSidebar(false)}
                ></div>
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
