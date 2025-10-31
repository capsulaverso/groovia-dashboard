import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RightAside from './components/RightAside';
import DocumentsPage from './components/pages/DocumentsPage';
import MyAgentsPage from './components/pages/MyAgentsPage';
import ProfilePage from './components/pages/ProfilePage';
import ChatPage from './components/pages/ChatPage';
import DocsPage from './components/pages/DocsPage';
import PrivacyPage from './components/pages/PrivacyPage';
import EULAPage from './components/pages/EULAPage';
import UsersManagementPage from './components/pages/UsersManagementPage';
import ReportsPage from './components/pages/ReportsPage';
import AgentsControlPage from './components/pages/AgentsControlPage';
import DecisionsHistoryPage from './components/pages/DecisionsHistoryPage';
import StrategicCalendarPage from './components/pages/StrategicCalendarPage';
import AgentLaboratoryPage from './components/pages/AgentLaboratoryPage';
import InspectorAgentPage from './components/pages/InspectorAgentPage';
import AdminUnifiedPanel from './components/pages/AdminUnifiedPanel';
import AdminPagesPanel from './components/pages/AdminPagesPanel';
import NotificationsPanel from './components/NotificationsPanel';
import { DatabaseTestPage } from './components/pages/DatabaseTestPage';
import LoginPage from './components/pages/LoginPage';
import InlineEditor from './components/InlineEditor';
import AgentActionFab from './components/AgentActionFab';
import { useUser } from './hooks/useUser';

// Lazy load do editor visual (GrapesJS é pesado)
const PageEditor = lazy(() => import('./components/pages/PageEditor'));

type ViewType = 'home' | 'documents' | 'my-agents' | 'profile' | 'chat' | 'decisions' | 'calendar' | 'agent-laboratory' | 'inspector' | 'docs' | 'privacy' | 'eula' | 
                'users' | 'reports' | 'agents-control' | 'admin' | 'pages-admin' | 'editor' | 'db-test' |
                'company' | 'strategy' | 'tactical' | 'marketing' | 'sales' | 'support';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewType>('home');
    const { user } = useUser();

    // Verificar query params para editor visual
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        if (pageParam) {
            setCurrentView('editor');
        }
    }, []);

    // Wrapper para navegação que aceita string e converte para ViewType
    const handleNavigate = (view: string) => {
        setCurrentView(view as ViewType);
    };

    if (!user) {
        return <LoginPage onLoginSuccess={() => setCurrentView('home')} />;
    }

    const renderContent = () => {
        switch (currentView) {
            case 'home':
                return <MainContent onNavigate={handleNavigate} />;
            case 'documents':
                return <DocumentsPage />;
            case 'my-agents':
                return <MyAgentsPage />;
            case 'profile':
                return <ProfilePage />;
            case 'chat':
                return <ChatPage />;
            case 'decisions':
                return <DecisionsHistoryPage />;
            case 'calendar':
                return <StrategicCalendarPage />;
            case 'agent-laboratory':
                return <AgentLaboratoryPage />;
            case 'inspector':
                return <InspectorAgentPage />;
            case 'docs':
                return <DocsPage />;
            case 'privacy':
                return <PrivacyPage />;
            case 'eula':
                return <EULAPage />;
            case 'users':
                return <UsersManagementPage />;
            case 'reports':
                return <ReportsPage />;
            case 'agents-control':
                return <AgentsControlPage />;
            case 'admin':
                return <AdminUnifiedPanel />;
            case 'pages-admin':
                return <AdminPagesPanel />;
            case 'editor':
                return (
                    <Suspense fallback={
                        <div className="flex min-h-screen items-center justify-center bg-[#111111] text-white">
                            <div className="text-center">
                                <div className="mb-4 animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                <p className="text-sm text-white/60">Carregando editor visual...</p>
                            </div>
                        </div>
                    }>
                        <PageEditor />
                    </Suspense>
                );
            case 'db-test':
                return <DatabaseTestPage />;
            // Novas views
            case 'company':
                return <div className="p-6"><h1 className="text-2xl font-bold mb-4">Empresa</h1><p>Página em desenvolvimento...</p></div>;
            case 'strategy':
                return <div className="p-6"><h1 className="text-2xl font-bold mb-4">Estratégia</h1><p>Página em desenvolvimento...</p></div>;
            case 'tactical':
                return <div className="p-6"><h1 className="text-2xl font-bold mb-4">Tático</h1><p>Página em desenvolvimento...</p></div>;
            case 'marketing':
                return <div className="p-6"><h1 className="text-2xl font-bold mb-4">Marketing</h1><p>Página em desenvolvimento...</p></div>;
            case 'sales':
                return <div className="p-6"><h1 className="text-2xl font-bold mb-4">Vendas</h1><p>Página em desenvolvimento...</p></div>;
            case 'support':
                return <div className="p-6"><h1 className="text-2xl font-bold mb-4">Atendimento</h1><p>Página em desenvolvimento...</p></div>;
            default:
                return <MainContent />;
        }
    };

    // Editor visual ocupa tela inteira sem sidebar
    if (currentView === 'editor') {
        return (
            <Suspense fallback={
                <div className="flex min-h-screen items-center justify-center bg-[#111111] text-white">
                    <div className="text-center">
                        <div className="mb-4 animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-white/60">Carregando editor visual...</p>
                    </div>
                </div>
            }>
                <PageEditor />
            </Suspense>
        );
    }

    return (
        <div className="flex min-h-screen">
            {currentView !== 'admin' && currentView !== 'pages-admin' && <Sidebar activeView={currentView} onNavigate={handleNavigate} />}
            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>
            {currentView === 'home' && <RightAside activeView={currentView} onNavigate={handleNavigate} />}
            {currentView !== 'chat' && currentView !== 'admin' && currentView !== 'pages-admin' && <NotificationsPanel />}

            {/* Editor Inline - Disponível em todas as páginas para admins */}
            <InlineEditor />

            {/* FAB de ação do agente - esconder em admin/editor */}
            {currentView !== 'admin' && currentView !== 'pages-admin' && currentView !== 'editor' && (
                <AgentActionFab defaultAgentCode="SCAN01" defaultTitle="SCAN Diagnóstico" defaultDescription="Entrevista guiada para diagnóstico do negócio" />
            )}
        </div>
    );
};

export default App;
