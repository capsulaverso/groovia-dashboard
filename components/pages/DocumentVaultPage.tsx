import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { apiClient } from '../../hooks/useApi';

interface Conversation {
  id: number;
  agentId: number;
  agentTitle: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
}

interface Agent {
  id: number;
  title: string;
  description: string;
}

interface Document {
  id: number;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  createdAt: string;
  expiresAt?: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

const DocumentVaultPage: React.FC = () => {
  const { user } = useUser();
  const [userHash, setUserHash] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [vaultToken, setVaultToken] = useState<string>('');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'documents' | 'team'>('documents');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (!user?.id) return;

        // Gerar hash do usuário
        const hashResponse = await apiClient.get<{ hash: string }>(`/users/${user.id}/hash?clientId=${user.clientId || 1}`);
        setUserHash(hashResponse.hash);

        // Carregar token do cofre
        const tokenResponse = await apiClient.get<{ accessToken: string }>(`/vault/token?clientId=${user.clientId || 1}`);
        setVaultToken(tokenResponse.accessToken);

        // Carregar conversas reais
        const conversationsData = await apiClient.get<Conversation[]>(`/users/${user.id}/conversations?clientId=${user.clientId || 1}`);
        setConversations(conversationsData);

        // Carregar agentes
        const agentsData = await apiClient.get<Agent[]>(`/agents?clientId=${user.clientId || 1}`);
        setAgents(agentsData);

        // Carregar documentos
        const docsData = await apiClient.get<Document[]>(`/vault/documents?clientId=${user.clientId || 1}`);
        setDocuments(docsData);

        // Carregar membros da equipe
        const membersData = await apiClient.get<TeamMember[]>(`/team-members?clientId=${user.clientId || 1}`);
        setTeamMembers(membersData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadInitialData();
  }, [user?.id, user?.clientId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !vaultToken) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('accessToken', vaultToken);

      // Upload via endpoint específico
      const response = await fetch(`/api/vault/documents/upload?clientId=${user?.clientId || 1}`, {
        method: 'POST',
        headers: {
          'x-session-token': localStorage.getItem('sessionToken') || 'dev-session-token',
          'x-user-id': String(user?.id),
          'x-client-id': String(user?.clientId || 1),
        },
        body: formData,
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments([...documents, newDoc]);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddTeamMember = async () => {
    if (!newMemberEmail) return;
    try {
      await apiClient.post('/team-members', {
        email: newMemberEmail,
        role: 'member',
        clientId: user?.clientId || 1,
      });
      setNewMemberEmail('');
      setShowTeamModal(false);
      // Recarregar membros
      const membersData = await apiClient.get<TeamMember[]>(`/team-members?clientId=${user?.clientId || 1}`);
      setTeamMembers(membersData);
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Histórico</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma conversa</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition ${
                    selectedConversation === conv.id
                      ? 'bg-primary/10 text-primary border border-primary'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white truncate">{conv.agentTitle}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{conv.messageCount} mensagens</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-1 overflow-y-auto">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Agentes</h2>
          <div className="space-y-2">
            {agents.slice(0, 10).map((agent) => (
              <div key={agent.id} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <span className="material-icons-outlined">menu</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cofre de Documentos</h1>
          </div>
          {userHash && (
            <div className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-gray-600 dark:text-gray-300">
              {userHash.substring(0, 16)}...
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-transparent">
          <div className="p-6 space-y-6">
            {/* Token Display */}
            {vaultToken && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                      <span className="material-icons-outlined text-base">lock</span>
                      Token de Acesso
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-mono break-all">{vaultToken}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(vaultToken);
                      alert('Token copiado!');
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`pb-4 font-medium border-b-2 transition ${
                    activeTab === 'documents'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Documentos
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`pb-4 font-medium border-b-2 transition ${
                    activeTab === 'team'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Equipe
                </button>
              </div>
            </div>

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Meus Documentos</h2>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition cursor-pointer font-medium">
                    <span className="material-icons-outlined text-base">upload_file</span>
                    Upload
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                      accept=".*"
                    />
                  </label>
                </div>

                {documents.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <span className="material-icons-outlined text-4xl text-gray-400 mx-auto block mb-2">insert_drive_file</span>
                    <p className="text-gray-600 dark:text-gray-400">Nenhum documento ainda</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between hover:shadow-md transition">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{doc.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{doc.fileSize} bytes • {doc.fileType}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">Enviado em {new Date(doc.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Membros da Equipe</h2>
                  <button
                    onClick={() => setShowTeamModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                  >
                    <span className="material-icons-outlined text-base">person_add</span>
                    Adicionar
                  </button>
                </div>

                {teamMembers.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <span className="material-icons-outlined text-4xl text-gray-400 mx-auto block mb-2">people</span>
                    <p className="text-gray-600 dark:text-gray-400">Nenhum membro ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Função: {member.role}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          member.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                          {member.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Adicionar Membro</h3>
            <div className="space-y-4">
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Email do membro"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTeamMember}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVaultPage;
