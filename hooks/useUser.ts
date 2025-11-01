import { useState, useEffect } from 'react';
import { apiClient } from './useApi';

export type UserRole = 'user' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    createdAt: string;
    clientId?: number;
    sessionToken?: string;
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
    clientId: 1,
    sessionToken: 'default-session',
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

    const updateUser = async (userData: Partial<User>) => {
        if (!user) return;
        
        try {
            // Atualizar no backend
            const clientId = user.clientId || 1;
            const updatedUser = await apiClient.put<User>(
                `/users/${user.id}?clientId=${clientId}`,
                userData
            );
            
            // Atualizar estado local
            setUser(updatedUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            
            console.log('✅ Perfil atualizado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error);
            // Em caso de erro, atualizar localStorage mesmo assim
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        }
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
