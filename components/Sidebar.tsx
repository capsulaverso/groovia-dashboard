
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const GrooviaLogo: React.FC = () => (
    <h1 className="text-on-surface-light dark:text-on-surface-dark text-2xl font-bold">
        Groovia
    </h1>
);

const ThemeSelector: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title={`Alternar para tema ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
            {theme === 'light' ? (
                <span className="material-icons-outlined text-gray-600 dark:text-gray-400">dark_mode</span>
            ) : (
                <span className="material-icons-outlined text-gray-600 dark:text-gray-400">light_mode</span>
            )}
        </button>
    );
};


const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 p-6 hidden lg:block">
            <div className="bg-surface-light dark:bg-surface-dark w-full h-full rounded-2xl flex flex-col p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                    <GrooviaLogo />
                    <ThemeSelector />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
