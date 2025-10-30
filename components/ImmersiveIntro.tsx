import React, { useState, useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

interface ImmersiveIntroProps {
  agentTitle: string;
  agentPrompt: string;
  firstQuestion: string;
  onComplete: (firstAnswer: string) => void;
}

const ImmersiveIntro: React.FC<ImmersiveIntroProps> = ({
  agentTitle,
  agentPrompt,
  firstQuestion,
  onComplete,
}) => {
  const [stage, setStage] = useState<'intro' | 'question' | 'transition'>('intro');
  const [userAnswer, setUserAnswer] = useState('');
  const [showInput, setShowInput] = useState(false);

  // Efeito de digitação para introdução - mais limpo e direto
  const introText = useTypewriter(
    `Olá! Sou o ${agentTitle}. Vou guiá-lo nesta etapa do diagnóstico estratégico.`,
    50,
    stage === 'intro'
  );

  // Efeito de digitação para pergunta
  const questionText = useTypewriter(
    firstQuestion,
    50,
    stage === 'question'
  );

  useEffect(() => {
    if (stage === 'intro' && introText.isComplete) {
      // Após completar a intro, espera 1s e mostra a pergunta
      const timer = setTimeout(() => {
        setStage('question');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [introText.isComplete, stage]);

  useEffect(() => {
    if (stage === 'question' && questionText.isComplete) {
      // Após completar a pergunta, mostra o input
      const timer = setTimeout(() => {
        setShowInput(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [questionText.isComplete, stage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Submit do formulário');
    console.log('💬 Resposta do usuário:', userAnswer);
    
    if (userAnswer.trim()) {
      console.log('✅ Resposta válida! Iniciando transição...');
      setStage('transition');
      
      // Aguarda animação e chama callback
      setTimeout(() => {
        console.log('🚀 Chamando onComplete com a resposta');
        onComplete(userAnswer);
      }, 1000);
    } else {
      console.warn('⚠️ Resposta vazia!');
    }
  };

  console.log('🎬 ImmersiveIntro renderizado');
  console.log('📊 Stage:', stage);
  console.log('💬 userAnswer:', userAnswer);
  
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background-light dark:bg-background-dark transition-opacity duration-1000 ${
        stage === 'transition' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="max-w-4xl mx-auto px-8">
        {/* Introdução */}
        {stage === 'intro' && (
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-on-surface-light dark:text-on-surface-dark mb-8 leading-tight">
              {introText.text}
              <span className="animate-pulse text-[#00FF7F]">|</span>
            </h1>
          </div>
        )}

        {/* Pergunta */}
        {stage === 'question' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold text-on-surface-light dark:text-on-surface-dark mb-8 leading-tight">
              {questionText.text}
              {!questionText.isComplete && (
                <span className="animate-pulse text-[#00FF7F]">|</span>
              )}
            </h2>

            {/* Input de resposta */}
            {showInput && (
              <form onSubmit={handleSubmit} className="animate-slide-up">
                <div className="relative">
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    className="w-full min-h-[80px] px-6 py-4 text-lg bg-surface-light dark:bg-surface-dark text-on-surface-light dark:text-on-surface-dark border-2 border-[#00FF7F]/30 rounded-2xl focus:outline-none focus:border-[#00FF7F] transition-all resize-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!userAnswer.trim()}
                    className="absolute bottom-4 right-4 px-6 py-3 bg-[#00FF7F] text-[#02281a] font-semibold rounded-xl hover:bg-[#00FF7F]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Continuar
                    <span className="material-icons-outlined text-xl">arrow_forward</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Loading durante transição */}
        {stage === 'transition' && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-16 h-16 border-4 border-[#00FF7F] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
              Preparando sua experiência...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImmersiveIntro;

