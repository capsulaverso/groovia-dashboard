import React, { useMemo, useState } from 'react';

import CardTemplate, { CardData } from './CardTemplate';
import PremiumChat from './PremiumChat';
import ChatModal from './ChatModal';

type AgentStatus = 'active' | 'inactive' | 'pending';

export interface AgentTemplateCardAgent {
  id: number;
  title: string;
  description: string;
  agentType: string;
  internalCode: string;
  status?: AgentStatus;
  isActive?: boolean;
  icon?: string;
  act?: string;
  badge?: string;
  progress?: number;
  createdAt?: string | Date;
  [key: string]: any;
}

type AgentTemplateCardMode = 'premium' | 'modal';

export interface AgentTemplateCardProps {
  agent: AgentTemplateCardAgent;
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  mode?: AgentTemplateCardMode;
  initialMessage?: string;
  cardClassName?: string;
  actionsLabel?: string;
  onChatOpen?: (agent: AgentTemplateCardAgent) => void;
  onChatClose?: (agent: AgentTemplateCardAgent) => void;
}

const AgentTemplateCard: React.FC<AgentTemplateCardProps> = ({
  agent,
  variant = 'default',
  mode = 'premium',
  initialMessage,
  cardClassName,
  actionsLabel = 'Conversar',
  onChatOpen,
  onChatClose,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const cardData = useMemo<CardData>(() => {
    const derivedStatus: AgentStatus | undefined = agent.status ?? (typeof agent.isActive === 'boolean'
      ? (agent.isActive ? 'active' : 'inactive')
      : undefined);

    return {
      id: agent.id,
      title: agent.title,
      description: agent.description,
      icon: agent.icon ?? 'smart_toy',
      status: derivedStatus,
      badge: agent.badge ?? agent.act,
      progress: agent.progress,
      createdAt: agent.createdAt,
    } satisfies CardData;
  }, [agent]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    onChatOpen?.(agent);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    onChatClose?.(agent);
  };

  const actionsButton = (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        handleOpenChat();
      }}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
    >
      <span className="material-icons-outlined text-base">chat</span>
      <span className="hidden sm:inline">{actionsLabel}</span>
    </button>
  );

  return (
    <>
      <CardTemplate
        data={cardData}
        variant={variant}
        onClick={handleOpenChat}
        className={cardClassName}
        actions={variant === 'default' ? actionsButton : undefined}
      />

      {mode === 'premium' && isChatOpen && (
        <PremiumChat
          isOpen={isChatOpen}
          onClose={handleCloseChat}
          agentTitle={agent.title}
          agentDescription={agent.description}
          agentType={agent.agentType}
          internalCode={agent.internalCode}
          agentId={agent.id}
          initialMessage={initialMessage}
        />
      )}

      {mode === 'modal' && isChatOpen && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={handleCloseChat}
          agentTitle={agent.title}
          agentDescription={agent.description}
          agentType={agent.agentType}
          internalCode={agent.internalCode}
        />
      )}
    </>
  );
};

export default AgentTemplateCard;


