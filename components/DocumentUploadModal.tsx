import React, { useState, useRef, useCallback } from 'react';

export interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => Promise<void>;
    userId: number;
    clientId: number;
    allowedTypes?: string[];
    maxSize?: number; // em bytes
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
    isOpen,
    onClose,
    onUpload,
    userId,
    clientId,
    allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    maxSize = 50 * 1024 * 1024 // 50MB default
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }
    }, []);

    const handleFiles = async (files: File[]) => {
        setError(null);
        
        // Validar arquivos
        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                setError(`Tipo de arquivo não permitido: ${file.name}`);
                return;
            }
            
            if (file.size > maxSize) {
                setError(`Arquivo muito grande: ${file.name} (máximo: ${maxSize / 1024 / 1024}MB)`);
                return;
            }
        }

        setUploadedFiles(files);
    };

    const handleUpload = async () => {
        if (uploadedFiles.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            for (const file of uploadedFiles) {
                await onUpload(file);
            }
            
            setUploadedFiles([]);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-title font-semibold text-on-surface-light dark:text-on-surface-dark">
                            Upload de Documentos
                        </h3>
                        <p className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark mt-1">
                            Faça upload de documentos para os agentes consultarem
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Fechar"
                    >
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>

                {/* Área de Drop */}
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                        isDragging
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                >
                    <div className="flex flex-col items-center">
                        <span className="material-icons-outlined text-6xl text-primary mb-4">
                            cloud_upload
                        </span>
                        <p className="text-body font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
                            Arraste arquivos aqui ou
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-body text-primary hover:underline mb-4"
                        >
                            clique para selecionar
                        </button>
                        <p className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-xs">
                            Suporta: PDF, DOCX, TXT (máx. {maxSize / 1024 / 1024}MB)
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="application/pdf,.docx,text/plain"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>

                {/* Arquivos Selecionados */}
                {uploadedFiles.length > 0 && (
                    <div className="mt-6 space-y-2">
                        <p className="text-body font-semibold text-on-surface-light dark:text-on-surface-dark">
                            Arquivos selecionados ({uploadedFiles.length})
                        </p>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {uploadedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="material-icons-outlined text-primary">
                                            description
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-body font-medium text-on-surface-light dark:text-on-surface-dark truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-body text-on-surface-secondary-light dark:text-on-surface-secondary-dark text-xs">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setUploadedFiles(files => files.filter((_, i) => i !== index));
                                        }}
                                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                        aria-label="Remover"
                                    >
                                        <span className="material-icons-outlined text-sm text-red-500">
                                            delete
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Erro */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                        <p className="text-body text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Ações */}
                <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-body font-semibold text-on-surface-secondary-light dark:text-on-surface-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={uploading || uploadedFiles.length === 0}
                        className="px-6 py-2 bg-primary text-white text-body font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <span className="animate-spin material-icons-outlined text-base">
                                    refresh
                                </span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <span className="material-icons-outlined text-base">upload</span>
                                Upload ({uploadedFiles.length})
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentUploadModal;

