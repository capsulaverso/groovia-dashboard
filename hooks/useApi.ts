import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useApi = <T,>(endpoint: string): ApiResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = () => setTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}${endpoint}`);
        
        if (!response.ok) {
          throw new Error(`Erro: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Erro na API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, trigger]);

  return { data, loading, error, refetch };
};

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Erro: ${response.statusText}`);
    }
    return response.json();
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Erro: ${response.statusText}`);
    }
    return response.json();
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Erro: ${response.statusText}`);
    }
    return response.json();
  },

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Erro: ${response.statusText}`);
    }
  },
};

export default useApi;
