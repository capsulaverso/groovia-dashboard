import React, { useState, useEffect } from 'react';
import type { AgentSkill, SkillsConfig } from '../shared/agentSkills.ts';
import { reorderSkills, skillsToConfig } from '../shared/agentSkills.ts';

interface AgentBuilderModalProps {
    agent: any;
    onSave: (data: any) => void;
    onClose: () => void;
}

interface SkillEditorProps {
    skill: AgentSkill;
    onChange: (skill: AgentSkill) => void;
    onDelete: () => void;
}

// Componente para editar uma skill individual
const SkillEditor: React.FC<SkillEditorProps> = ({ skill, onChange, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleUpdate = (updates: Partial<AgentSkill>) => {
        onChange({ ...skill, ...updates });
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Header da Skill */}
            <div
                className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="material-icons-outlined text-blue-500">
                        {skill.type === 'upload' && 'upload_file'}
                        {skill.type === 'chart' && 'bar_chart'}
                        {skill.type === 'checklist' && 'checklist'}
                        {skill.type === 'analysis' && 'analytics'}
                        {skill.type === 'document_request' && 'description'}
                        {skill.type === 'predict' && 'trending_up'}
                        {skill.type === 'insight' && 'lightbulb'}
                        {skill.type === 'custom' && 'extension'}
                    </span>
                    <div className="flex-1">
                        <h4 className="font-semibold text-on-surface-light dark:text-on-surface-dark">
                            {skill.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{skill.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={skill.enabled}
                            onChange={(e) => handleUpdate({ enabled: e.target.checked })}
                            onClick={(e) => e.stopPropagation()}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                        <span className="material-icons-outlined text-red-500 text-lg">delete</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                        <span className={`material-icons-outlined text-on-surface-light dark:text-on-surface-dark transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>
                </div>
            </div>

            {/* Conteúdo Expandido */}
            {isExpanded && (
                <div className="p-4 bg-white dark:bg-gray-800 space-y-4">
                    {/* Ordem de Execução */}
                    <div>
                        <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-2">
                            Ordem de Execução
                        </label>
                        <input
                            type="number"
                            value={skill.order}
                            onChange={(e) => handleUpdate({ order: parseInt(e.target.value) || 0 })}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    {/* Configuração Específica por Tipo */}
                    {skill.type === 'upload' && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-2">
                                    Tipos Permitidos
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['pdf', 'docx', 'xlsx', 'png', 'jpg'].map((type) => (
                                        <label key={type} className="flex items-center gap-1 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={(skill as any).allowedTypes?.includes(type)}
                                                onChange={(e) => {
                                                    const current = (skill as any).allowedTypes || [];
                                                    const updated = e.target.checked
                                                        ? [...current, type]
                                                        : current.filter((t: string) => t !== type);
                                                    handleUpdate({ allowedTypes: updated } as any);
                                                }}
                                                className="rounded"
                                            />
                                            <span className="text-sm text-on-surface-light dark:text-on-surface-dark">
                                                {type.toUpperCase()}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-2">
                                    Tamanho Máximo (MB)
                                </label>
                                <input
                                    type="number"
                                    value={(skill as any).maxSizeMB || 10}
                                    onChange={(e) => handleUpdate({ maxSizeMB: parseInt(e.target.value) || 10 } as any)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {skill.type === 'chart' && (
                        <div>
                            <label className="block text-sm font-medium text-on-surface-light dark:text-on-surface-dark mb-2">
                                Tipos de Gráfico
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['bar', 'line', 'pie', 'area'].map((type) => (
                                    <label key={type} className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={(skill as any).chartTypes?.includes(type)}
                                            onChange={(e) => {
                                                const current = (skill as any).chartTypes || [];
                                                const updated = e.target.checked
                                                    ? [...current, type]
                                                    : current.filter((t: string) => t !== type);
                                                handleUpdate({ chartTypes: updated } as any);
                                            }}
                                            className="rounded"
                                        />
                                        <span className="text-sm text-on-surface-light dark:text-on-surface-dark capitalize">
                                            {type}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {skill.type === 'checklist' && (
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={(skill as any).dynamicItems || false}
                                    onChange={(e) => handleUpdate({ dynamicItems: e.target.checked } as any)}
                                    className="rounded"
                                />
                                <span className="text-sm text-on-surface-light dark:text-on-surface-dark">
                                    Permitir itens dinâmicos (gerados pelo agente)
                                </span>
                            </label>
                        </div>
                    )}

                    {(skill.type === 'document_request' || skill.type === 'analysis' || skill.type === 'predict' || skill.type === 'insight' || skill.type === 'custom') && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                            Configuração avançada disponível na próxima versão.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const AgentBuilderModal: React.FC<AgentBuilderModalProps> = ({ agent, onSave, onClose }) => {
    const [activeTab, setActiveTab] = useState<'identity' | 'skills' | 'workflow' | 'context' | 'interface'>('identity');
    const [skills, setSkills] = useState<AgentSkill[]>([]);

    // Inicializar skills do agente (se já configurado)
    useEffect(() => {
        if (agent?.skillsConfig) {
            setSkills(reorderSkills((agent.skillsConfig as SkillsConfig).skills || []));
        }
    }, [agent]);

    // Templates de Skills Padrão
    const skillTemplates: AgentSkill[] = [
        {
            id: 'skill-upload-1',
            type: 'upload',
            name: 'Upload de Documento',
            description: 'Permite anexar PDFs, imagens e planilhas',
            enabled: false,
            order: 0,
            allowedTypes: ['pdf', 'docx', 'xlsx'],
            maxSizeMB: 10,
        },
        {
            id: 'skill-chart-1',
            type: 'chart',
            name: 'Geração de Gráficos',
            description: 'Exibe dados em barras, linhas, pizza ou área',
            enabled: false,
            order: 0,
            chartTypes: ['bar', 'line'],
        },
        {
            id: 'skill-checklist-1',
            type: 'checklist',
            name: 'Checklist Interativo',
            description: 'Lista de tarefas que o usuário pode marcar',
            enabled: false,
            order: 0,
            dynamicItems: true,
        },
        {
            id: 'skill-analysis-1',
            type: 'analysis',
            name: 'Análise de Dados',
            description: 'Analisa sentimentos, riscos e tendências',
            enabled: false,
            order: 0,
            analysisTypes: ['sentiment', 'risk'],
            outputFormat: 'mixed',
        },
        {
            id: 'skill-doc-request-1',
            type: 'document_request',
            name: 'Solicitar Documentos',
            description: 'Solicita documentos específicos do usuário',
            enabled: false,
            order: 0,
            documentTypes: ['pdf', 'xlsx'],
        },
        {
            id: 'skill-predict-1',
            type: 'predict',
            name: 'Previsão e Forecasting',
            description: 'Gera previsões de receita, risco e tendências',
            enabled: false,
            order: 0,
            predictionTypes: ['revenue', 'risk'],
            horizonDays: 30,
            confidenceThreshold: 80,
        },
        {
            id: 'skill-insight-1',
            type: 'insight',
            name: 'Insights Automáticos',
            description: 'Gera insights profundos a partir de dados',
            enabled: false,
            order: 0,
            insightDepth: 'deep',
            sources: ['context', 'profile'],
        },
    ];

    const addSkill = (template: AgentSkill) => {
        const nextOrder = skills.length;
        const newSkill: AgentSkill = {
            ...template,
            id: `${template.type}-${Date.now()}`,
            order: nextOrder,
        };
        setSkills([...skills, newSkill]);
    };

    const updateSkill = (index: number, updated: AgentSkill) => {
        const updatedSkills = [...skills];
        updatedSkills[index] = updated;
        setSkills(updatedSkills);
    };

    const deleteSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        const skillsConfig = skillsToConfig(skills);
        
        const agentData = {
            skillsConfig,
            // Outros campos serão adicionados nas próximas tabs
        };

        onSave(agentData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark">
                            Agent Builder
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Configure habilidades, fluxos e interface
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 bg-gray-50 dark:bg-gray-900/50">
                    {[
                        { id: 'identity', label: 'Identidade', icon: 'badge' },
                        { id: 'skills', label: 'Skills', icon: 'extension' },
                        { id: 'workflow', label: 'Fluxo', icon: 'account_tree' },
                        { id: 'context', label: 'Contexto', icon: 'database' },
                        { id: 'interface', label: 'Interface', icon: 'dashboard' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-3 flex items-center gap-2 font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-primary'
                            }`}
                        >
                            <span className="material-icons-outlined text-xl">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'identity' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <span className="material-icons-outlined text-blue-500 text-2xl">info</span>
                                    <div className="text-sm text-blue-900 dark:text-blue-200">
                                        <strong>Identidade do Agente:</strong> Configure nome, descrição, propósito e função.
                                        Exemplo: "ÆON_DocAnalyzer - agente para interpretar PDFs e gerar relatórios".
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                A configuração de identidade está disponível no modal de configuração principal.
                            </p>
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="space-y-6">
                            {/* Galeria de Skills */}
                            <div>
                                <h3 className="text-lg font-semibold text-on-surface-light dark:text-on-surface-dark mb-4">
                                    Galeria de Skills
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {skillTemplates.map((template) => (
                                        <button
                                            key={template.type}
                                            onClick={() => addSkill(template)}
                                            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="material-icons-outlined text-primary">
                                                    {template.type === 'upload' && 'upload_file'}
                                                    {template.type === 'chart' && 'bar_chart'}
                                                    {template.type === 'checklist' && 'checklist'}
                                                    {template.type === 'analysis' && 'analytics'}
                                                    {template.type === 'document_request' && 'description'}
                                                    {template.type === 'predict' && 'trending_up'}
                                                    {template.type === 'insight' && 'lightbulb'}
                                                    {template.type === 'custom' && 'extension'}
                                                </span>
                                                <span className="font-semibold text-on-surface-light dark:text-on-surface-dark text-sm">
                                                    {template.name}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {template.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Skills Configuradas */}
                            {skills.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-on-surface-light dark:text-on-surface-dark mb-4">
                                        Skills Configuradas ({skills.filter(s => s.enabled).length} ativas)
                                    </h3>
                                    <div className="space-y-3">
                                        {reorderSkills(skills).map((skill, index) => (
                                            <SkillEditor
                                                key={skill.id}
                                                skill={skill}
                                                onChange={(updated) => updateSkill(index, updated)}
                                                onDelete={() => deleteSkill(index)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {skills.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                    <span className="material-icons-outlined text-6xl text-gray-400 mb-4">auto_awesome</span>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Nenhuma skill configurada ainda.
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">
                                        Clique em uma skill da galeria para adicionar.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'workflow' && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            <span className="material-icons-outlined text-6xl text-gray-400 mb-4">account_tree</span>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Fluxograma Visual
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                                Define o comportamento lógico entre as etapas do agente.
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                                Disponível na próxima versão
                            </p>
                        </div>
                    )}

                    {activeTab === 'context' && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            <span className="material-icons-outlined text-6xl text-gray-400 mb-4">database</span>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Contexto e Persistência
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                                Gerencia dados que o agente usa e compartilha.
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                                Disponível na próxima versão
                            </p>
                        </div>
                    )}

                    {activeTab === 'interface' && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            <span className="material-icons-outlined text-6xl text-gray-400 mb-4">dashboard</span>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Interface
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                                Escolhe como o agente se apresenta (Card, Chat, Modal, etc).
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                                Disponível na próxima versão
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
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
                        Salvar Configuração
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgentBuilderModal;

