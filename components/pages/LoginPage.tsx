import React, { useState } from 'react';
import { apiClient } from '../../hooks/useApi';
import { useUser, type User } from '../../hooks/useUser';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
  clientId?: number;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useUser();

  const normalizeUser = (apiUser: LoginResponse): User => {
    return {
      id: String(apiUser.id),
      name: apiUser.name,
      email: apiUser.email,
      role: (apiUser.role as 'user' | 'admin') || 'user',
      avatar: apiUser.avatar,
      createdAt: apiUser.createdAt || new Date().toISOString(),
      clientId: apiUser.clientId || 1,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const apiUser = await apiClient.post<LoginResponse>('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      const user = normalizeUser(apiUser);
      login(user);
      onLoginSuccess();
    } catch (err: any) {
      const errorMessage = err?.response?.error || err?.message || 'Email ou senha inválidos';
      setError(errorMessage);
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPassword: string) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setError('');
    setLoading(true);

    try {
      const apiUser = await apiClient.post<LoginResponse>('/auth/login', { 
        email: quickEmail, 
        password: quickPassword 
      });
      
      const user = normalizeUser(apiUser);
      login(user);
      onLoginSuccess();
    } catch (err: any) {
      const errorMessage = err?.response?.error || err?.message || 'Erro ao fazer login';
      setError(errorMessage);
      console.error('Erro no login rápido:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl mb-4 shadow-lg">
            <span className="material-icons-outlined text-white text-3xl">insights</span>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Groovia</h1>
          <p className="text-gray-600 dark:text-gray-400">Dashboard de Inteligência de Negócios</p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <span className="material-icons-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="seu@email.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <span className="material-icons-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-fade-in">
              <span className="material-icons-outlined text-lg">error_outline</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Entrando...</span>
              </>
            ) : (
              <>
                <span className="material-icons-outlined">login</span>
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>

        {/* Login Rápido */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4 uppercase tracking-wider">
            Login rápido (demonstração)
          </p>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickLogin('usuario@groovia.com', 'user123')}
              disabled={loading}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-icons-outlined text-lg">person</span>
              <span>Entrar como Usuário</span>
            </button>
            <button
              onClick={() => handleQuickLogin('admin@groovia.com', 'admin123')}
              disabled={loading}
              className="w-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium py-2.5 px-4 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span className="material-icons-outlined text-lg">admin_panel_settings</span>
              <span>Entrar como Admin</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Powered by <span className="font-semibold text-primary">Capsula Aeon®</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
