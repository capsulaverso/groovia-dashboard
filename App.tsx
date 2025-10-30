import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RightAside from './components/RightAside';
import DocumentsPage from './components/pages/DocumentsPage';
import MyAgentsPage from './components/pages/MyAgentsPage';
import ProfilePage from './components/pages/ProfilePage';
import DocsPage from './components/pages/DocsPage';
import PrivacyPage from './components/pages/PrivacyPage';
import EULAPage from './components/pages/EULAPage';
import UsersManagementPage from './components/pages/UsersManagementPage';
import ReportsPage from './components/pages/ReportsPage';
import AgentsControlPage from './components/pages/AgentsControlPage';
import { DatabaseTestPage } from './components/pages/DatabaseTestPage';
import LoginPage from './components/pages/LoginPage';
import { useUser } from './hooks/useUser';

type ViewType = 'home' | 'documents' | 'my-agents' | 'profile' | 'docs' | 'privacy' | 'eula' | 
                'users' | 'reports' | 'agents-control' | 'db-test' |
                'company' | 'strategy' | 'tactical' | 'marketing' | 'sales' | 'support';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewType>('home');
    const { user } = useUser();

    if (!user) {
        return <LoginPage onLoginSuccess={() => setCurrentView('home')} />;
    }

    const renderContent = () => {
        switch (currentView) {
            case 'home':
                return <MainContent onNavigate={setCurrentView} />;
            case 'documents':
                return <DocumentsPage />;
            case 'my-agents':
                return <MyAgentsPage />;
            case 'profile':
                return <ProfilePage />;
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

    return (
        <div className="flex min-h-screen">
            <Sidebar activeView={currentView} onNavigate={setCurrentView} />
            <main className="flex-1 p-6 overflow-y-auto">
                {renderContent()}
            </main>
            {currentView === 'home' && <RightAside activeView={currentView} onNavigate={setCurrentView} />}
        </div>
    );
};

export default App;
