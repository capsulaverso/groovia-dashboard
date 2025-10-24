
import React from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RightAside from './components/RightAside';

const App: React.FC = () => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <MainContent />
            <RightAside />
        </div>
    );
};

export default App;
