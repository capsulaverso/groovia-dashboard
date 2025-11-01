import React from 'react';
import { ChatMessage } from '../../types';

interface LinkMessageProps {
  message: ChatMessage;
}

export const LinkMessage: React.FC<LinkMessageProps> = ({ message }) => {
  const linkData = message.metadata?.linkData;

  if (!linkData) {
    return (
      <div className="text-message">
        <p className="whitespace-pre-wrap">{message.message}</p>
      </div>
    );
  }

  const handleLinkClick = () => {
    window.open(linkData.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="link-message bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      {message.message && (
        <p className="text-gray-900 dark:text-white mb-4">{message.message}</p>
      )}
      
      <button
        onClick={handleLinkClick}
        className="w-full flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
      >
        {linkData.thumbnail && (
          <div className="flex-shrink-0 w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img 
              src={linkData.thumbnail} 
              alt={linkData.title || 'Link preview'} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {linkData.title || linkData.url}
            </h4>
            <svg className="flex-shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          
          {linkData.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {linkData.description}
            </p>
          )}
          
          <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 truncate">
            {linkData.url}
          </p>
        </div>
      </button>
    </div>
  );
};
