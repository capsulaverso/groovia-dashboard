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

type ViewType = 'home' | 'documents' | 'my-agents' | 'profile' | 'docs' | 'privacy' | 'eula' | 
                'users' | 'reports' | 'agents-control';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewType>('home');

    const renderContent = () => {
        switch (currentView) {
            case 'home':
                return <MainContent />;
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
            {currentView === 'home' && <RightAside />}
        </div>
    );
};

export default App;
