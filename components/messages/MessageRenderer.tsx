import React from 'react';
import { ChatMessage } from '../../types';
import { TextMessage } from './TextMessage';
import { ChartMessage } from './ChartMessage';
import { DocumentMessage } from './DocumentMessage';
import { LinkMessage } from './LinkMessage';
import { ApprovalMessage } from './ApprovalMessage';

interface MessageRendererProps {
  message: ChatMessage;
  onApprovalAction?: (requestId: string, optionId: string, optionValue: string) => void;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ message, onApprovalAction }) => {
  const messageType = message.messageType || 'text';

  switch (messageType) {
    case 'chart':
      return <ChartMessage message={message} />;
    case 'document':
      return <DocumentMessage message={message} />;
    case 'link':
      return <LinkMessage message={message} />;
    case 'approval':
      return <ApprovalMessage message={message} onApprovalAction={onApprovalAction} />;
    case 'text':
    default:
      return <TextMessage message={message} />;
  }
};
