import React, { useState } from 'react';
import { ChatMessage } from '../../types';

interface ApprovalMessageProps {
  message: ChatMessage;
  onApprovalAction?: (requestId: string, optionId: string, optionValue: string) => void;
}

export const ApprovalMessage: React.FC<ApprovalMessageProps> = ({ message, onApprovalAction }) => {
  const approvalRequest = message.metadata?.approvalRequest;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!approvalRequest) {
    return (
      <div className="text-message">
        <p className="whitespace-pre-wrap">{message.message}</p>
      </div>
    );
  }

  const handleApproval = async (option: typeof approvalRequest.options[0]) => {
    if (isSubmitting || approvalRequest.status !== 'pending') return;

    setIsSubmitting(true);
    setSelectedOption(option.id);

    try {
      if (onApprovalAction) {
        await onApprovalAction(approvalRequest.requestId, option.id, option.value);
      }
    } catch (error) {
      console.error('Error submitting approval:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (approvalRequest.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Aprovado
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Rejeitado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="approval-message bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      {message.message && (
        <p className="text-gray-900 dark:text-white mb-4">{message.message}</p>
      )}
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {approvalRequest.title}
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {approvalRequest.description}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-2 mt-4">
          {approvalRequest.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isDisabled = approvalRequest.status !== 'pending' || isSubmitting;

            return (
              <button
                key={option.id}
                onClick={() => handleApproval(option)}
                disabled={isDisabled}
                className={`
                  w-full px-4 py-3 text-left rounded-lg border-2 transition-all
                  ${isSelected 
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }
                  ${isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                  {isSelected && isSubmitting && (
                    <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {approvalRequest.status === 'pending' && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Selecione uma opção para continuar
          </p>
        )}
      </div>
    </div>
  );
};
