import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface AgentStep {
  stepNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  gradient: string;
}

interface AgentStepCardProps {
  step: AgentStep;
  onClick?: () => void;
  index: number;
}

const AgentStepCard: React.FC<AgentStepCardProps> = ({ step, onClick, index }) => {
  const { stepNumber, title, description, status, gradient } = step;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.set(cardRef.current, {
        autoAlpha: 1,
        scale: 0,
      });

      gsap.to(cardRef.current, {
        duration: 1,
        scale: 1,
        transformOrigin: 'center center',
        ease: `back.out(${1.5 + index * 0.25})`,
        delay: 0.8 * index,
      });
    }
  }, [index]);

  // Detectar se o gradiente é claro ou escuro para ajustar contraste
  const isLightGradient = gradient.includes('#D9D9D9') || gradient.includes('#E8E8E8');
  
  // Cores baseadas no status e contraste
  const statusColors = {
    completed: {
      lines: isLightGradient ? 'bg-[#333333]' : 'bg-white/80',
      textColor: isLightGradient ? 'text-[#333333]' : 'text-white',
      shine: true,
      badge: {
        bg: isLightGradient ? 'bg-[#333333]/20' : 'bg-white/20',
        border: isLightGradient ? 'border-[#333333]/40' : 'border-white/40',
        text: isLightGradient ? 'text-[#333333]' : 'text-white',
        icon: 'check_circle',
        label: 'Concluído',
      },
    },
    current: {
      lines: isLightGradient ? 'bg-[#333333]' : 'bg-white/80',
      textColor: isLightGradient ? 'text-[#333333]' : 'text-white',
      shine: true,
      badge: {
        bg: isLightGradient ? 'bg-[#333333]/20' : 'bg-white/20',
        border: isLightGradient ? 'border-[#333333]/40' : 'border-white/40',
        text: isLightGradient ? 'text-[#333333]' : 'text-white',
        icon: 'radio_button_checked',
        label: 'Etapa Atual',
      },
    },
    pending: {
      lines: 'bg-gray-400',
      textColor: 'text-gray-600',
      shine: false,
      badge: {
        bg: 'bg-gray-300',
        border: 'border-gray-400',
        text: 'text-gray-700',
        icon: 'schedule',
        label: 'Aguardando',
      },
    },
  };

  const colors = statusColors[status];

  // Formatar número com zero à esquerda (01, 02, 03...)
  const formattedNumber = String(stepNumber).padStart(2, '0');

  return (
    <div
      ref={cardRef}
      className={`agent-step-card group relative overflow-hidden rounded-2xl border-2 border-black/10 transition-all duration-300 hover:scale-[1.03] ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{
        background: gradient,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        opacity: 0,
      }}
      onClick={onClick}
    >
      {/* Efeito de luz passando (shimmer) */}
      {colors.shine && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]">
          <div className="h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}

      {/* Conteúdo do Card - Layout Simplificado */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[220px] p-6 text-center">
        {/* Número Centralizado */}
        <div className="mb-4">
          <span className="text-6xl font-black text-[#333333] tracking-tighter">
            {formattedNumber}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-base font-bold text-[#333333] mb-3 px-2 line-clamp-2">
          {title}
        </h3>

        {/* 3 Linhas decorativas */}
        <div className="space-y-1.5 mb-3 w-full max-w-[140px]">
          <div className="h-0.5 bg-[#333333] rounded-full" style={{ width: '100%' }} />
          <div className="h-0.5 bg-[#333333] rounded-full mx-auto" style={{ width: '85%' }} />
          <div className="h-0.5 bg-[#333333] rounded-full mx-auto" style={{ width: '70%' }} />
        </div>

        {/* Descrição */}
        <p className="text-xs text-[#333333]/70 line-clamp-2 max-w-[200px]">
          {description}
        </p>
      </div>

      {/* Hover overlay sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/0 group-hover:from-black/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
    </div>
  );
};

export default AgentStepCard;

