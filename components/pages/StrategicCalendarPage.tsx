import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { apiClient } from '../../hooks/useApi';

interface CalendarEvent {
    id: number;
    title: string;
    agentName: string;
    agentInternalCode: string;
    date: string;
    time: string;
    status: 'confirmed' | 'pending' | 'late';
    type: 'delivery' | 'meeting' | 'milestone';
    link?: string;
}

const StrategicCalendarPage: React.FC = () => {
    const { user } = useUser();
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Carregar eventos
    useEffect(() => {
        const loadEvents = async () => {
            try {
                const response = await apiClient.get(`/calendar/events?userId=${user?.id}&clientId=${user?.clientId || 1}`);
                setEvents(response);
            } catch (error) {
                console.error('Erro ao carregar eventos:', error);
                // Mock data para demonstração
                const today = new Date();
                setEvents([
                    {
                        id: 1,
                        title: 'Dossiê Estratégico v1',
                        agentName: 'SCAN: O Decodificador',
                        agentInternalCode: 'AGT-SC-001',
                        date: today.toISOString().split('T')[0],
                        time: '14:00',
                        status: 'confirmed',
                        type: 'delivery',
                        link: '/documents'
                    },
                    {
                        id: 2,
                        title: 'Revisão de Personas',
                        agentName: 'O Criador de Personas',
                        agentInternalCode: 'AGT-AM-003',
                        date: new Date(today.getTime() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
                        time: '10:00',
                        status: 'pending',
                        type: 'meeting',
                    },
                    {
                        id: 3,
                        title: 'Groovia Intelligence',
                        agentName: 'Groovia Intelligence',
                        agentInternalCode: 'AGT-AM-005',
                        date: new Date(today.getTime() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
                        time: '16:00',
                        status: 'confirmed',
                        type: 'milestone',
                        link: '/documents'
                    },
                ]);
            }
        };

        if (user?.id) {
            loadEvents();
        }
    }, [user?.id, user?.clientId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return '#00FFB2';
            case 'pending': return '#FFB200';
            case 'late': return '#FF4D4D';
            default: return '#B0B0B0';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Confirmado';
            case 'pending': return 'Pendente';
            case 'late': return 'Atrasado';
            default: return status;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'delivery': return 'description';
            case 'meeting': return 'event';
            case 'milestone': return 'flag';
            default: return 'circle';
        }
    };

    // Calcular dias da semana
    const getWeekDays = () => {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        const start = new Date(startOfWeek.setDate(diff));
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = getWeekDays();

    // Agrupar eventos por data
    const eventsByDate: { [key: string]: CalendarEvent[] } = {};
    events.forEach(event => {
        if (!eventsByDate[event.date]) {
            eventsByDate[event.date] = [];
        }
        eventsByDate[event.date].push(event);
    });

    const formatDateHeader = (date: Date) => {
        return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-white p-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-medium mb-2">Calendário Estratégico</h1>
                            <p className="text-[#B0B0B0]">Acompanhe etapas, reuniões e entregas dos agentes</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    viewMode === 'week'
                                        ? 'bg-[#00FFB2] text-black'
                                        : 'bg-[#1E1E1E] text-white hover:bg-[#2A2A2A]'
                                }`}
                            >
                                Semanal
                            </button>
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    viewMode === 'month'
                                        ? 'bg-[#00FFB2] text-black'
                                        : 'bg-[#1E1E1E] text-white hover:bg-[#2A2A2A]'
                                }`}
                            >
                                Mensal
                            </button>
                            <button className="px-4 py-2 bg-[#007BFF] text-white rounded-lg font-medium hover:bg-[#0056CC] transition-colors flex items-center gap-2">
                                <span className="material-icons-outlined">add</span>
                                Gerenciar Etapas
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                {viewMode === 'week' ? (
                    <div className="grid grid-cols-7 gap-4">
                        {weekDays.map((day, index) => {
                            const dayKey = day.toISOString().split('T')[0];
                            const dayEvents = eventsByDate[dayKey] || [];
                            
                            return (
                                <div
                                    key={index}
                                    className={`bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-4 min-h-[400px] ${
                                        isToday(day) ? 'border-[#00FFB2]' : ''
                                    }`}
                                >
                                    <div className="mb-4">
                                        <h3 className="text-base font-medium text-white mb-1">
                                            {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                        </h3>
                                        <p className={`text-2xl font-medium ${isToday(day) ? 'text-[#00FFB2]' : 'text-[#B0B0B0]'}`}>
                                            {day.getDate()}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {dayEvents.length === 0 ? (
                                            <p className="text-xs text-[#B0B0B0] opacity-50">Sem eventos</p>
                                        ) : (
                                            dayEvents.map(event => (
                                                <div
                                                    key={event.id}
                                                    className="p-2 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg hover:border-[#00FFB2] transition-all cursor-pointer"
                                                    style={{ borderLeftColor: getStatusColor(event.status), borderLeftWidth: '4px' }}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span
                                                            className="material-icons-outlined text-sm"
                                                            style={{ color: getStatusColor(event.status) }}
                                                        >
                                                            {getTypeIcon(event.type)}
                                                        </span>
                                                        <span className="text-xs font-medium text-white">{event.time}</span>
                                                    </div>
                                                    <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">{event.title}</h4>
                                                    <p className="text-xs text-[#B0B0B0] line-clamp-1">{event.agentName}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-[#B0B0B0]">
                        <span className="material-icons-outlined text-5xl mb-4 block opacity-50">calendar_month</span>
                        <p>Visualização mensal em desenvolvimento</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StrategicCalendarPage;

