import React from 'react';
import { ChatMessage } from '../../types';

interface TextMessageProps {
  message: ChatMessage;
}

export const TextMessage: React.FC<TextMessageProps> = ({ message }) => {
  return (
    <div className="text-message">
      <p className="whitespace-pre-wrap">{message.message}</p>
    </div>
  );
};
