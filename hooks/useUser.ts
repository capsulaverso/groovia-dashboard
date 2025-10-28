import { useState, useEffect } from 'react';

export type UserRole = 'user' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    createdAt: string;
}

interface UseUserReturn {
    user: User | null;
    isAdmin: boolean;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const USER_STORAGE_KEY = 'groovia_user';

const DEFAULT_USER: User = {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@groovia.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=12',
    createdAt: new Date().toISOString(),
};

export const useUser = (): UseUserReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Erro ao carregar usuário:', error);
                setUser(DEFAULT_USER);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
            }
        } else {
            setUser(DEFAULT_USER);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
        }
        
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
    };

    const updateUser = (userData: Partial<User>) => {
        if (!user) return;
        
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    };

    return {
        user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        logout,
        updateUser,
    };
};
