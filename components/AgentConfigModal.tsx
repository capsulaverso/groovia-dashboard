import React, { useState, useEffect } from 'react';
import type { AgentConfiguration, AgentIntegration } from '../types';

interface AgentConfigModalProps {
    agent: AgentConfiguration | null;
    onSave: (agent: AgentConfiguration) => void;
    onClose: () => void;
}

const AgentConfigModal: React.FC<AgentConfigModalProps> = ({ agent, onSave, onClose }) => {
    const [name, setName] = useState(agent?.name || '');
    const [description, setDescription] = useState(agent?.description || '');
    const [type, setType] = useState(agent?.type || 'Agente de Diagnóstico');
    const [act, setAct] = useState(agent?.act || 'Ato 01');
    const [integrationType, setIntegrationType] = useState<'webhook' | 'n8n' | 'langchain'>(
        agent?.integration.type || 'webhook'
    );

    // Webhook fields
    const [webhookUrl, setWebhookUrl] = useState(
        agent?.integration.type === 'webhook' ? agent.integration.webhookUrl : ''
    );
    const [webhookMethod, setWebhookMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>(
        agent?.integration.type === 'webhook' ? agent.integration.method : 'POST'
    );
    const [webhookHeaders, setWebhookHeaders] = useState(
        agent?.integration.type === 'webhook' && agent.integration.headers
            ? JSON.stringify(agent.integration.headers, null, 2)
            : '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer YOUR_TOKEN"\n}'
    );

    // N8N fields
    const [n8nUrl, setN8nUrl] = useState(
        agent?.integration.type === 'n8n' ? agent.integration.n8nUrl : ''
    );
    const [n8nWorkflowId, setN8nWorkflowId] = useState(
        agent?.integration.type === 'n8n' ? agent.integration.workflowId || '' : ''
    );

    // LangChain fields
    const [langchainUrl, setLangchainUrl] = useState(
        agent?.integration.type === 'langchain' ? agent.integration.apiUrl : ''
    );
    const [langchainApiKey, setLangchainApiKey] = useState(
        agent?.integration.type === 'langchain' ? agent.integration.apiKey : ''
    );
    const [langchainAgentId, setLangchainAgentId] = useState(
        agent?.integration.type === 'langchain' ? agent.integration.agentId || '' : ''
    );
    const [langchainModel, setLangchainModel] = useState(
        agent?.integration.type === 'langchain' ? agent.integration.model || 'gpt-4' : 'gpt-4'
    );

    const agentTypes = [
        'Agente de Diagnóstico',
        'Agente de Pesquisa',
        'Agente Estratégico',
        'Agente Criativo',
        'Agente de Branding',
        'Agente Financeiro',
        'Agente Personalizado'
    ];

    const handleSave = () => {
        // Validar campos obrigatórios
        if (!name.trim()) {
            alert('Nome do agente é obrigatório');
            return;
        }

        let integration: AgentIntegration;

        try {
            switch (integrationType) {
                case 'webhook':
                    if (!webhookUrl.trim()) {
                        alert('URL do Webhook é obrigatória');
                        return;
                    }
                    integration = {
                        type: 'webhook',
                        webhookUrl,
                        method: webhookMethod,
                        headers: JSON.parse(webhookHeaders)
                    };
                    break;

                case 'n8n':
                    if (!n8nUrl.trim()) {
                        alert('URL do N8N é obrigatória');
                        return;
                    }
                    integration = {
                        type: 'n8n',
                        n8nUrl,
                        workflowId: n8nWorkflowId || undefined
                    };
                    break;

                case 'langchain':
                    if (!langchainUrl.trim() || !langchainApiKey.trim()) {
                        alert('URL da API e API Key do LangChain são obrigatórios');
                        return;
                    }
                    integration = {
                        type: 'langchain',
                        apiUrl: langchainUrl,
                        apiKey: langchainApiKey,
                        agentId: langchainAgentId || undefined,
                        model: langchainModel
                    };
                    break;
            }

            const agentData: AgentConfiguration = {
                id: agent?.id || '',
                name: name.trim(),
                description: description.trim(),
                type,
                act: act.trim(),
                status: agent?.status || 'active',
                integration,
                createdAt: agent?.createdAt || new Date(),
                updatedAt: new Date()
            };

            onSave(agentData);
        } catch (error) {
            alert('Erro ao validar os dados. Verifique os campos e tente novamente.');
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark">
                        {agent ? 'Editar Agente' : 'Criar Novo Agente'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <label className="block text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                            Nome do Agente *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: SCAN CLARITY"
                            className="w-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                            Descrição
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva a função do agente..."
                            rows={3}
                            className="w-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                                Tipo de Agente
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary"
                            >
                                {agentTypes.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                                Tag (Ato) *
                            </label>
                            <select
                                value={act}
                                onChange={(e) => setAct(e.target.value)}
                                className="w-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary"
                            >
                                <option value="Ato 01">Ato 01</option>
                                <option value="Ato 02">Ato 02</option>
                                <option value="Ato 03">Ato 03</option>
                                <option value="Ato 04">Ato 04</option>
                                <option value="Ato 05">Ato 05</option>
                            </select>
                        </div>
                    </div>

                    {/* Integration Type */}
                    <div>
                        <label className="block text-sm font-semibold text-on-surface-light dark:text-on-surface-dark mb-3">
                            Tipo de Integração *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setIntegrationType('webhook')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    integrationType === 'webhook'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                }`}
                            >
                                <span className="material-icons-outlined text-blue-500 text-3xl mb-2">
                                    webhook
                                </span>
                                <p className="text-sm font-semibold">WebHook</p>
                            </button>

                            <button
                                onClick={() => setIntegrationType('n8n')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    integrationType === 'n8n'
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                                }`}
                            >
                                <span className="material-icons-outlined text-orange-500 text-3xl mb-2">
                                    account_tree
                                </span>
                                <p className="text-sm font-semibold">N8N</p>
                            </button>

                            <button
                                onClick={() => setIntegrationType('langchain')}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    integrationType === 'langchain'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                }`}
                            >
                                <span className="material-icons-outlined text-purple-500 text-3xl mb-2">
                                    link
                                </span>
                                <p className="text-sm font-semibold">LangChain</p>
                            </button>
                        </div>
                    </div>

                    {/* Integration Config */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4">
                        <h3 className="text-sm font-semibold text-on-surface-light dark:text-on-surface-dark flex items-center gap-2">
                            <span className="material-icons-outlined text-primary">settings</span>
                            Configuração da Integração
                        </h3>

                        {integrationType === 'webhook' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-1">
                                        URL do Webhook *
                                    </label>
                                    <input
                                        type="url"
                                        value={webhookUrl}
                                        onChange={(e) => setWebhookUrl(e.target.value)}
                                        placeholder="https://your-webhook.com/endpoint"
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-1">
                                        Método HTTP
                                    </label>
                                    <select
                                        value={webhookMethod}
                                        onChange={(e) => setWebhookMethod(e.target.value as any)}
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-sm"
                                    >
                                        <option value="POST">POST</option>
                                        <option value="GET">GET</option>
                                        <option value="PUT">PUT</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-1">
                                        Headers (JSON)
                                    </label>
                                    <textarea
                                        value={webhookHeaders}
                                        onChange={(e) => setWebhookHeaders(e.target.value)}
                                        rows={5}
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-sm font-mono resize-none"
                                    />
                                </div>
                            </>
                        )}

                        {integrationType === 'n8n' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-1">
                                        URL do N8N *
                                    </label>
                                    <input
                                        type="url"
                                        value={n8nUrl}
                                        onChange={(e) => setN8nUrl(e.target.value)}
                                        placeholder="https://n8n.example.com/webhook/your-workflow"
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-1">
                                        Workflow ID (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={n8nWorkflowId}
                                        onChange={(e) => setN8nWorkflowId(e.target.value)}
                                        placeholder="wf-12345"
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-sm"
                                    />
                                </div>
                            </>
                        )}

                        {integrationType === 'langchain' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-1">
                                        API URL *
                                    </label>
                                    <input
                                        type="url"
                                        value={langchainUrl}
                                        onChange={(e) => setLangchainUrl(e.target.value)}
                                        placeholder="https://langchain-api.example.com/agent"
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-1">
                                        API Key *
                                    </label>
                                    <input
                                        type="password"
                                        value={langchainApiKey}
                                        onChange={(e) => setLangchainApiKey(e.target.value)}
                                        placeholder="lc_api_key_xxxxx"
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-sm font-mono"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-1">
                                            Agent ID (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={langchainAgentId}
                                            onChange={(e) => setLangchainAgentId(e.target.value)}
                                            placeholder="agent-001"
                                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-1">
                                            Model
                                        </label>
                                        <select
                                            value={langchainModel}
                                            onChange={(e) => setLangchainModel(e.target.value)}
                                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-sm"
                                        >
                                            <option value="gpt-4">GPT-4</option>
                                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                            <option value="claude-3">Claude 3</option>
                                            <option value="gemini-pro">Gemini Pro</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                        <span className="material-icons-outlined text-sm">save</span>
                        {agent ? 'Salvar Alterações' : 'Criar Agente'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgentConfigModal;
