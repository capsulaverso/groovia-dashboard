import React, { useState } from 'react';

interface Document {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
    retentionDays: number;
    expiresAt: string;
}

const DocumentsPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([
        {
            id: '1',
            name: 'Análise de Mercado Q4 2024.pdf',
            type: 'PDF',
            size: '2.4 MB',
            uploadDate: '2024-10-15',
            retentionDays: 90,
            expiresAt: '2025-01-13',
        },
        {
            id: '2',
            name: 'Pesquisa de Personas.xlsx',
            type: 'Excel',
            size: '856 KB',
            uploadDate: '2024-10-20',
            retentionDays: 60,
            expiresAt: '2024-12-19',
        },
        {
            id: '3',
            name: 'Estratégia de Brand.docx',
            type: 'Word',
            size: '1.2 MB',
            uploadDate: '2024-10-25',
            retentionDays: 120,
            expiresAt: '2025-02-22',
        },
    ]);

    const [showRetentionModal, setShowRetentionModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.')) {
            setDocuments(docs => docs.filter(d => d.id !== id));
        }
    };

    const handleChangeRetention = (doc: Document) => {
        setSelectedDoc(doc);
        setShowRetentionModal(true);
    };

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'pdf': return 'picture_as_pdf';
            case 'excel': return 'table_chart';
            case 'word': return 'description';
            default: return 'insert_drive_file';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark mb-2">
                        Meus Documentos
                    </h1>
                    <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        Gerencie seus documentos e configure políticas de retenção de dados
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-primary/30">
                    <span className="material-icons-outlined">upload_file</span>
                    <span className="font-medium">Upload</span>
                </button>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4 flex items-start gap-3">
                <span className="material-icons-outlined text-yellow-600 dark:text-yellow-500">info</span>
                <div className="flex-1">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                        Política de Privacidade e Retenção de Dados
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        De acordo com a LGPD, você pode definir por quanto tempo o Groovia pode armazenar seus documentos. 
                        Após o prazo, os arquivos serão automaticamente excluídos de forma permanente e irreversível.
                    </p>
                </div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase tracking-wider">
                                    Documento
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase tracking-wider">
                                    Tamanho
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase tracking-wider">
                                    Upload
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase tracking-wider">
                                    Retenção
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase tracking-wider">
                                    Expira em
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {documents.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="material-icons-outlined text-primary text-2xl">
                                                {getTypeIcon(doc.type)}
                                            </span>
                                            <div>
                                                <div className="font-medium text-on-surface-light dark:text-on-surface-dark">
                                                    {doc.name}
                                                </div>
                                                <div className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                                    {doc.type}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                        {doc.size}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                        {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleChangeRetention(doc)}
                                            className="text-sm text-primary hover:text-purple-700 font-medium flex items-center gap-1"
                                        >
                                            {doc.retentionDays} dias
                                            <span className="material-icons-outlined text-sm">edit</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                                        {new Date(doc.expiresAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                title="Baixar"
                                            >
                                                <span className="material-icons-outlined text-gray-600 dark:text-gray-400">download</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Excluir permanentemente"
                                            >
                                                <span className="material-icons-outlined text-red-600 dark:text-red-400">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {documents.length === 0 && (
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <span className="material-icons-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">folder_open</span>
                    <h3 className="text-xl font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                        Nenhum documento ainda
                    </h3>
                    <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-4">
                        Faça upload do seu primeiro documento para começar
                    </p>
                </div>
            )}
        </div>
    );
};

export default DocumentsPage;
