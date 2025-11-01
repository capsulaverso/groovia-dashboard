import React from 'react';
import { ChatMessage } from '../../types';

interface DocumentMessageProps {
  message: ChatMessage;
}

export const DocumentMessage: React.FC<DocumentMessageProps> = ({ message }) => {
  const document = message.metadata?.documentRef;

  if (!document) {
    return (
      <div className="text-message">
        <p className="whitespace-pre-wrap">{message.message}</p>
      </div>
    );
  }

  const handleDownload = () => {
    if (document.documentUrl) {
      window.open(document.documentUrl, '_blank');
    }
  };

  return (
    <div className="document-message bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      {message.message && (
        <p className="text-gray-900 dark:text-white mb-4">{message.message}</p>
      )}
      
      <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {document.documentName}
          </h4>
          {document.preview && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {document.preview}
            </p>
          )}
          <button
            onClick={handleDownload}
            disabled={!document.documentUrl}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar documento
          </button>
        </div>
      </div>
    </div>
  );
};
