import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { apiClient } from '../../hooks/useApi';

interface UserHistoryPageProps {
    slug: string;
    onClose?: () => void;
}

interface HistoryItem {
    id: number;
    action: string;
    timestamp: string;
    agentName?: string;
    agentCode?: string;
    details?: string;
    type: 'registration' | 'upload' | 'interaction' | 'decision' | 'milestone';
}

interface DocumentLink {
    id: number;
    name: string;
    type: string;
    uploadedAt: string;
    url?: string;
}

interface DecisionLink {
    id: number;
    title: string;
    date: string;
    status: string;
}

const UserHistoryPage: React.FC<UserHistoryPageProps> = ({ slug, onClose }) => {
    const { user: currentUser } = useUser();
    const [userData, setUserData] = useState<any>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [documents, setDocuments] = useState<DocumentLink[]>([]);
    const [decisions, setDecisions] = useState<DecisionLink[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserHistory = async () => {
            try {
                // Buscar usuário por slug
                const users = await apiClient.get(`/users?clientId=${currentUser?.clientId || 1}`);
                const user = users.find((u: any) => u.slug === slug || u.hashIdentifier === slug);
                
                if (!user) {
                    alert('Usuário não encontrado');
                    return;
                }

                setUserData(user);

                // Carregar histórico
                try {
                    const historyData = await apiClient.get(`/users/${user.id}/history?clientId=${currentUser?.clientId || 1}`);
                    setHistory(historyData);
                } catch (error) {
                    // Mock data
                    setHistory([
                        {
                            id: 1,
                            action: 'Usuário cadastrado no sistema',
                            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
                            type: 'registration'
                        },
                        {
                            id: 2,
                            action: 'Iniciou interação com SCAN: O Decodificador',
                            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
                            agentName: 'SCAN: O Decodificador',
                            agentCode: 'AGT-SC-001',
                            type: 'interaction'
                        },
                        {
                            id: 3,
                            action: 'Upload de documento: Briefing_Cliente_2024.pdf',
                            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
                            details: 'Briefing_Cliente_2024.pdf (2.4 MB)',
                            type: 'upload'
                        },
                        {
                            id: 4,
                            action: 'Decisão aprovada: Estratégia de posicionamento no mercado premium',
                            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
                            agentName: 'Groovia Intelligence',
                            agentCode: 'AGT-AM-005',
                            type: 'decision'
                        },
                        {
                            id: 5,
                            action: 'Marco alcançado: Dossiê Estratégico completo',
                            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
                            type: 'milestone'
                        },
                    ]);
                }

                // Carregar documentos
                try {
                    const docs = await apiClient.get(`/users/${user.id}/documents?clientId=${currentUser?.clientId || 1}`);
                    setDocuments(docs);
                } catch (error) {
                    setDocuments([]);
                }

                // Carregar decisões
                try {
                    const decs = await apiClient.get(`/users/${user.id}/decisions?clientId=${currentUser?.clientId || 1}`);
                    setDecisions(decs);
                } catch (error) {
                    setDecisions([]);
                }

            } catch (error) {
                console.error('Erro ao carregar histórico:', error);
                alert('Erro ao carregar histórico do usuário');
            } finally {
                setLoading(false);
            }
        };

        if (slug && currentUser) {
            loadUserHistory();
        }
    }, [slug, currentUser]);

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'registration': return 'person_add';
            case 'upload': return 'upload_file';
            case 'interaction': return 'chat_bubble';
            case 'decision': return 'check_circle';
            case 'milestone': return 'flag';
            default: return 'circle';
        }
    };

    const getActionColor = (type: string) => {
        switch (type) {
            case 'registration': return '#007BFF';
            case 'upload': return '#00FFB2';
            case 'interaction': return '#FFB200';
            case 'decision': return '#FF4D4D';
            case 'milestone': return '#9B59B6';
            default: return '#B0B0B0';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleExportHistory = async () => {
        alert('Funcionalidade de exportação será implementada em breve!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00FFB2] mx-auto"></div>
                    <p className="mt-4 text-[#B0B0B0]">Carregando histórico...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="text-center">
                    <span className="material-icons-outlined text-6xl text-[#B0B0B0] mb-4">person_off</span>
                    <h2 className="text-2xl font-medium text-white mb-2">Usuário não encontrado</h2>
                    <p className="text-[#B0B0B0]">O histórico solicitado não existe ou foi removido</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white p-4 lg:p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 lg:mb-12">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 lg:gap-3 mb-2">
                                {onClose && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-[#1E1E1E] rounded-lg transition-colors"
                                    >
                                        <span className="material-icons-outlined">arrow_back</span>
                                    </button>
                                )}
                                <h1 className="text-2xl lg:text-3xl font-medium break-words">{userData.name}</h1>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                                <p className="text-sm lg:text-base text-[#B0B0B0] break-all">{userData.email}</p>
                                <span className="px-3 py-1 bg-[#007BFF] bg-opacity-10 text-[#007BFF] rounded-full text-xs lg:text-sm font-medium">
                                    {userData.role}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleExportHistory}
                            className="w-full lg:w-auto px-6 py-3 bg-[#00FFB2] text-black rounded-lg font-medium hover:bg-[#00E6A0] transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-icons-outlined">download</span>
                            <span className="hidden sm:inline">Exportar Histórico</span>
                            <span className="sm:hidden">Exportar</span>
                        </button>
                    </div>
                </div>

                {/* Timeline de Ações */}
                <div className="bg-[#1E1E1E] rounded-lg p-4 lg:p-6 mb-6 lg:mb-8">
                    <h2 className="text-lg font-medium mb-6">Linha do Tempo</h2>
                    <div className="relative">
                        {history.map((item, index) => (
                            <div key={item.id} className="relative pb-6 lg:pb-8 last:pb-0">
                                {/* Linha vertical */}
                                {index < history.length - 1 && (
                                    <div className="absolute left-6 lg:left-8 top-12 lg:top-16 w-0.5 h-full bg-[#2A2A2A]" />
                                )}

                                {/* Item */}
                                <div className="flex items-start gap-3 lg:gap-4">
                                    {/* Ícone */}
                                    <div
                                        className="w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: getActionColor(item.type) + '20' }}
                                    >
                                        <span
                                            className="material-icons-outlined text-xl lg:text-2xl"
                                            style={{ color: getActionColor(item.type) }}
                                        >
                                            {getActionIcon(item.type)}
                                        </span>
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="flex-1">
                                        <h3 className="text-sm lg:text-base font-medium text-white mb-1">{item.action}</h3>
                                        {item.agentName && (
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="text-xs lg:text-sm text-[#007BFF] bg-[#007BFF] bg-opacity-10 px-2 py-1 rounded-full">
                                                    {item.agentCode}
                                                </span>
                                                <span className="text-xs lg:text-sm text-[#B0B0B0]">{item.agentName}</span>
                                            </div>
                                        )}
                                        {item.details && (
                                            <p className="text-xs lg:text-sm text-[#B0B0B0] mb-2">{item.details}</p>
                                        )}
                                        <p className="text-xs text-[#B0B0B0]">{formatTimestamp(item.timestamp)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cards de Informações Adicionais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Documentos Vinculados */}
                    <div className="bg-[#1E1E1E] rounded-lg p-4 lg:p-6">
                        <h3 className="text-base lg:text-lg font-medium mb-4 flex items-center gap-2">
                            <span className="material-icons-outlined text-[#00FFB2]">description</span>
                            Documentos Vinculados
                        </h3>
                        {documents.length === 0 ? (
                            <p className="text-[#B0B0B0]">Nenhum documento vinculado</p>
                        ) : (
                            <div className="space-y-3">
                                {documents.map(doc => (
                                    <div key={doc.id} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-3 hover:border-[#00FFB2] transition-all">
                                        <p className="text-sm font-medium text-white mb-1">{doc.name}</p>
                                        <p className="text-xs text-[#B0B0B0]">{doc.type} • {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Decisões Tomadas */}
                    <div className="bg-[#1E1E1E] rounded-lg p-4 lg:p-6">
                        <h3 className="text-base lg:text-lg font-medium mb-4 flex items-center gap-2">
                            <span className="material-icons-outlined text-[#007BFF]">check_circle</span>
                            Decisões Tomadas
                        </h3>
                        {decisions.length === 0 ? (
                            <p className="text-[#B0B0B0]">Nenhuma decisão registrada</p>
                        ) : (
                            <div className="space-y-3">
                                {decisions.map(decision => (
                                    <div key={decision.id} className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-3 hover:border-[#00FFB2] transition-all">
                                        <p className="text-sm font-medium text-white mb-1">{decision.title}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                decision.status === 'approved' ? 'bg-[#007BFF] bg-opacity-10 text-[#007BFF]' :
                                                decision.status === 'pending' ? 'bg-[#FFB200] bg-opacity-10 text-[#FFB200]' :
                                                'bg-[#FF4D4D] bg-opacity-10 text-[#FF4D4D]'
                                            }`}>
                                                {decision.status}
                                            </span>
                                            <span className="text-xs text-[#B0B0B0]">{new Date(decision.date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserHistoryPage;
