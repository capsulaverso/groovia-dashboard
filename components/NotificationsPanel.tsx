import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { apiClient } from '../hooks/useApi';

interface Notification {
    id: number;
    type: 'system' | 'agent' | 'document' | 'urgent';
    title: string;
    description: string;
    timestamp: string;
    status: 'new' | 'read';
    actionUrl?: string;
}

const NotificationsPanel: React.FC = () => {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filterType, setFilterType] = useState<string>('all');
    const [unreadCount, setUnreadCount] = useState(0);

    // Carregar notificações
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const response = await apiClient.get(`/notifications?userId=${user?.id}&clientId=${user?.clientId || 1}`);
                setNotifications(response);
                setUnreadCount(response.filter((n: Notification) => n.status === 'new').length);
            } catch (error) {
                console.error('Erro ao carregar notificações:', error);
                // Mock data para demonstração
                setNotifications([
                    {
                        id: 1,
                        type: 'agent',
                        title: 'Agente SCAN concluiu diagnósticos',
                        description: 'O agente SCAN finalizou a análise inicial do negócio.',
                        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                        status: 'new',
                        actionUrl: '/profile'
                    },
                    {
                        id: 2,
                        type: 'document',
                        title: 'Novo dossiê disponível',
                        description: 'O dossiê estratégico foi gerado e está pronto para visualização.',
                        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                        status: 'new',
                        actionUrl: '/documents'
                    },
                    {
                        id: 3,
                        type: 'urgent',
                        title: 'Ação requerida',
                        description: 'Por favor, revise e aprove as diretrizes estratégicas.',
                        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                        status: 'read',
                    },
                ]);
                setUnreadCount(2);
            }
        };

        if (user?.id) {
            loadNotifications();
        }
    }, [user?.id, user?.clientId]);

    // Marcar como lido
    const markAsRead = async (notificationId: number) => {
        try {
            await apiClient.put(`/notifications/${notificationId}/read?clientId=${user?.clientId || 1}`, {});
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, status: 'read' as const } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Erro ao marcar como lido:', error);
        }
    };

    // Filtrar notificações
    const filteredNotifications = notifications.filter(n => {
        if (filterType === 'all') return true;
        return n.type === filterType;
    });

    const getStatusColor = (status: string) => {
        return status === 'new' ? '#00FFB2' : 'transparent';
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'system': return '#007BFF';
            case 'agent': return '#00FFB2';
            case 'document': return '#FFB200';
            case 'urgent': return '#FF4D4D';
            default: return '#B0B0B0';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
        
        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="w-80 bg-[#0F0F0F] border-l border-[#2A2A2A] flex flex-col" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Header */}
            <div className="p-6 border-b border-[#2A2A2A]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-white">Notificações</h2>
                    {unreadCount > 0 && (
                        <span className="bg-[#00FFB2] text-black text-xs px-2 py-1 rounded-full font-medium">
                            {unreadCount}
                        </span>
                    )}
                </div>

                {/* Filtro */}
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FFB2]"
                >
                    <option value="all">Todas</option>
                    <option value="system">Sistema</option>
                    <option value="agent">Agentes</option>
                    <option value="document">Documentos</option>
                    <option value="urgent">Urgentes</option>
                </select>
            </div>

            {/* Lista de Notificações */}
            <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                    <div className="p-6 text-center text-[#B0B0B0]">
                        <span className="material-icons-outlined text-5xl mb-4 block opacity-50">notifications_none</span>
                        <p>Nenhuma notificação</p>
                    </div>
                ) : (
                    <div className="p-3 space-y-3">
                        {filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`p-5 rounded-lg border transition-all ${
                                    notification.status === 'new'
                                        ? 'bg-[#1E1E1E] border-[#00FFB2]'
                                        : 'bg-[#1E1E1E] border-[#2A2A2A]'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: getTypeColor(notification.type) }}
                                        />
                                        <h3 className="text-base font-medium text-white">{notification.title}</h3>
                                    </div>
                                    {notification.status === 'new' && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="p-1 hover:bg-[#0F0F0F] rounded transition-colors"
                                            title="Marcar como lido"
                                        >
                                            <span className="material-icons-outlined text-[#B0B0B0] text-sm">close</span>
                                        </button>
                                    )}
                                </div>
                                
                                <p className="text-sm text-[#B0B0B0] leading-relaxed mb-3">
                                    {notification.description}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-[#B0B0B0]">
                                        {formatTimestamp(notification.timestamp)}
                                    </span>
                                    {notification.actionUrl && (
                                        <button className="text-xs text-[#007BFF] font-medium hover:text-[#0056CC] transition-colors">
                                            Ver →
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#2A2A2A]">
                <button className="text-xs text-[#B0B0B0] hover:text-[#FFFFFF] transition-colors">
                    Marcar todas como lidas
                </button>
            </div>
        </div>
    );
};

export default NotificationsPanel;

