import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './useApi';

export interface ApiUser {
  id: number;
  clientId: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export const useUsers = (clientId: number) => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<ApiUser[]>(`/users?clientId=${clientId}`);
      setUsers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar usuários';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      fetchUsers();
    }
  }, [fetchUsers, clientId]);

  const createUser = async (userData: Omit<ApiUser, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newUser = await apiClient.post<ApiUser>(`/users?clientId=${clientId}`, userData);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar usuário';
      throw new Error(message);
    }
  };

  const updateUser = async (id: number, userData: Partial<ApiUser>) => {
    try {
      const updatedUser = await apiClient.put<ApiUser>(`/users/${id}?clientId=${clientId}`, userData);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      return updatedUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar usuário';
      throw new Error(message);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await apiClient.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar usuário';
      throw new Error(message);
    }
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  };
};

export default useUsers;

