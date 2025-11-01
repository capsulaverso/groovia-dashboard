import React, { ReactNode } from 'react';

/**
 * 🎨 CARD TEMPLATE SYSTEM
 * Sistema reutilizável de cards com múltiplas variantes
 */

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface CardData {
  id?: string | number;
  title: string;
  description?: string;
  icon?: string;
  status?: 'active' | 'inactive' | 'pending';
  badge?: string;
  progress?: number;
  backgroundColor?: string;
  createdAt?: string | Date;
  [key: string]: any;
}

export interface CardTemplateProps {
  data: CardData;
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  onClick?: () => void;
  actions?: React.ReactNode;
  children?: ReactNode;
  showStatus?: boolean;
  className?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'inactive':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    default:
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  }
};

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'active': return 'Ativo';
    case 'inactive': return 'Inativo';
    case 'pending': return 'Pendente';
    default: return status || '';
  }
};

const getIconClass = (icon?: string) => {
  if (!icon) return 'smart_toy';
  return icon;
};

// ============================================================================
// CARD VARIANTS
// ============================================================================

// VARIANT 1: DEFAULT - Completo e balanceado
const DefaultCard: React.FC<CardTemplateProps> = ({ 
  data, 
  onClick, 
  actions, 
  showStatus = true,
  className = ''
}) => (
  <div 
    onClick={onClick}
    className={`bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-primary transition-all cursor-pointer group ${className}`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
        <span className="material-icons-outlined text-primary group-hover:text-white text-2xl">
          {getIconClass(data.icon)}
        </span>
      </div>
      {showStatus && data.status && (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
          {getStatusLabel(data.status)}
        </span>
      )}
    </div>
    <h3 className="text-lg font-semibold text-on-surface-light dark:text-on-surface-dark mb-2">
      {data.title}
    </h3>
    <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-4 line-clamp-3">
      {data.description}
    </p>
    {data.badge && (
      <div className="mb-3">
        <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/30">
          {data.badge}
        </span>
      </div>
    )}
    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
        ID: {data.id}
      </div>
      {actions || (
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <span className="material-icons-outlined text-primary">arrow_forward</span>
        </button>
      )}
    </div>
  </div>
);

// VARIANT 2: COMPACT - Minimalista e compacto
const CompactCard: React.FC<CardTemplateProps> = ({ 
  data, 
  onClick, 
  showStatus = true,
  className = ''
}) => (
  <div 
    onClick={onClick}
    className={`bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-primary transition-all cursor-pointer ${className}`}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="material-icons-outlined text-primary text-lg">
          {getIconClass(data.icon)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-on-surface-light dark:text-on-surface-dark truncate">
          {data.title}
        </h3>
        <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark line-clamp-1">
          {data.description}
        </p>
      </div>
      {showStatus && data.status && (
        <span className={`px-2 py-1 rounded text-xs whitespace-nowrap flex-shrink-0 ${getStatusColor(data.status)}`}>
          {getStatusLabel(data.status)}
        </span>
      )}
    </div>
  </div>
);

// VARIANT 3: DETAILED - Com mais informações e progresso
const DetailedCard: React.FC<CardTemplateProps> = ({ 
  data, 
  onClick, 
  showStatus = true,
  className = ''
}) => {
  const progress = data.progress || 0;
  
  return (
    <div 
      onClick={onClick}
      className={`bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all cursor-pointer ${className}`}
    >
      {/* Header com icon e status */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="material-icons-outlined text-primary text-2xl">
            {getIconClass(data.icon)}
          </span>
        </div>
        {showStatus && data.status && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
            {getStatusLabel(data.status)}
          </span>
        )}
      </div>

      {/* Título e descrição */}
      <h3 className="font-semibold text-base mb-2 text-on-surface-light dark:text-on-surface-dark">
        {data.title}
      </h3>
      <p className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark leading-relaxed mb-4">
        {data.description}
      </p>

      {/* Progress bar se houver */}
      {typeof progress === 'number' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-on-surface-light dark:text-on-surface-dark">Progresso</span>
            <span className="text-xs font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-primary/60 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Badge if exists */}
      {data.badge && (
        <div className="mb-4">
          <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/30">
            {data.badge}
          </span>
        </div>
      )}

      {/* Footer info */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
        <div className="flex items-center justify-between">
          <span>ID: {data.id}</span>
          {data.createdAt && <span>{new Date(data.createdAt).toLocaleDateString('pt-BR')}</span>}
        </div>
      </div>
    </div>
  );
};

// VARIANT 4: MINIMAL - Super compacto
const MinimalCard: React.FC<CardTemplateProps> = ({ 
  data, 
  onClick, 
  className = ''
}) => (
  <div 
    onClick={onClick}
    className={`bg-surface-light dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-primary transition-all cursor-pointer ${className}`}
  >
    <div className="flex items-center gap-2">
      <span className="material-icons-outlined text-primary text-base flex-shrink-0">
        {getIconClass(data.icon)}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-xs text-on-surface-light dark:text-on-surface-dark truncate">
          {data.title}
        </div>
      </div>
      {data.status && (
        <div className="w-2 h-2 rounded-full flex-shrink-0" 
          style={{
            backgroundColor: data.status === 'active' ? '#22c55e' : data.status === 'pending' ? '#eab308' : '#ef4444'
          }}
        />
      )}
    </div>
  </div>
);

// ============================================================================
// MAIN CARD TEMPLATE COMPONENT
// ============================================================================

const CardTemplate: React.FC<CardTemplateProps> = ({
  data,
  variant = 'default',
  onClick,
  actions,
  children,
  showStatus = true,
  className = ''
}) => {
  const commonProps = { 
    data, 
    onClick, 
    showStatus, 
    className 
  };

  switch (variant) {
    case 'compact':
      return <CompactCard {...commonProps} />;
    case 'detailed':
      return <DetailedCard {...commonProps} />;
    case 'minimal':
      return <MinimalCard {...commonProps} />;
    default:
      return <DefaultCard {...commonProps} actions={actions} />;
  }
};

export default CardTemplate;

// ============================================================================
// EXPORT DE COMPONENTES INDIVIDUAIS
// ============================================================================

export { DefaultCard, CompactCard, DetailedCard, MinimalCard };
