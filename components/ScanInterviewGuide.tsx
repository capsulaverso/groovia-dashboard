import React, { useState, useEffect } from 'react';

interface Question {
    id: string;
    category: string;
    question: string;
    placeholder: string;
    required: boolean;
}

interface ScanInterviewGuideProps {
    onComplete: (answers: Record<string, string>) => void;
    onQuestionAnswer: (questionId: string, answer: string) => void;
}

// Perguntas estruturadas do SCAN baseadas no system prompt
const SCAN_QUESTIONS: Question[] = [
    // BLOCO 1: CONTEXTO
    {
        id: 'context-1',
        category: 'CONTEXTO',
        question: 'Qual é o nome da sua empresa e em qual setor vocês atuam?',
        placeholder: 'Ex: Tech Solutions, software house focada em automação...',
        required: true
    },
    {
        id: 'context-2',
        category: 'CONTEXTO',
        question: 'Há quanto tempo a empresa existe? Quantas pessoas compõem a equipe atual?',
        placeholder: 'Ex: 3 anos, equipe de 12 pessoas...',
        required: true
    },
    {
        id: 'context-3',
        category: 'CONTEXTO',
        question: 'Qual é o faturamento anual atual da empresa? E qual a meta para os próximos 12 meses?',
        placeholder: 'Ex: R$ 1.2M atualmente, meta de R$ 5M...',
        required: true
    },
    
    // BLOCO 2: DESAFIOS
    {
        id: 'challenges-1',
        category: 'DESAFIOS',
        question: 'Quais são os principais obstáculos que estão impedindo o crescimento do negócio?',
        placeholder: 'Ex: Limitação de equipe, problemas no processo comercial...',
        required: true
    },
    {
        id: 'challenges-2',
        category: 'DESAFIOS',
        question: 'Qual desafio você considera mais crítico e por quê?',
        placeholder: 'Descreva o desafio mais impactante...',
        required: true
    },
    
    // BLOCO 3: OBJETIVOS
    {
        id: 'objectives-1',
        category: 'OBJETIVOS',
        question: 'Onde você quer que a empresa esteja em 12 meses? (Objetivos SMART)',
        placeholder: 'Ex: Aumentar faturamento em 300%, expandir para 3 novos segmentos...',
        required: true
    },
    {
        id: 'objectives-2',
        category: 'OBJETIVOS',
        question: 'Qual é a visão de longo prazo (3-5 anos) para o negócio?',
        placeholder: 'Descreva onde a empresa estará em 3-5 anos...',
        required: true
    },
    
    // BLOCO 4: RECURSOS
    {
        id: 'resources-1',
        category: 'RECURSOS',
        question: 'Qual o orçamento disponível para investimento em crescimento? E como está distribuído?',
        placeholder: 'Ex: R$ 500k dividido em: marketing 40%, tecnologia 30%...',
        required: true
    },
    {
        id: 'resources-2',
        category: 'RECURSOS',
        question: 'Que tecnologias e ferramentas vocês já utilizam? O que falta implementar?',
        placeholder: 'Ex: CRM, automação de vendas, falta sistema de analytics...',
        required: true
    },
    
    // BLOCO 5: MERCADO
    {
        id: 'market-1',
        category: 'MERCADO',
        question: 'Qual é o seu segmento de mercado principal? Quem são os principais concorrentes?',
        placeholder: 'Ex: B2B SaaS para pequenas empresas, concorrentes são X e Y...',
        required: true
    },
    {
        id: 'market-2',
        category: 'MERCADO',
        question: 'Quais tendências do setor vocês estão acompanhando? Como estão se posicionando?',
        placeholder: 'Ex: IA generativa, automação, estamos focando em inovação...',
        required: true
    },
    
    // BLOCO 6: PROPOSTA DE VALOR
    {
        id: 'value-1',
        category: 'PROPOSTA DE VALOR',
        question: 'O que torna sua empresa única? Qual é a proposta de valor que diferencia vocês dos concorrentes?',
        placeholder: 'Ex: Somos os únicos com IA personalizada, entregamos em 48h...',
        required: true
    },
    {
        id: 'value-2',
        category: 'PROPOSTA DE VALOR',
        question: 'Por que os clientes escolhem vocês? Qual o principal benefício que entregam?',
        placeholder: 'Ex: Economia de tempo, ROI comprovado, suporte 24/7...',
        required: true
    }
];

// Hook para efeito de digitação
const useTypewriter = (text: string, speed: number = 30, enabled: boolean = true) => {
    const [displayText, setDisplayText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!enabled || !text) {
            setDisplayText('');
            setIsComplete(false);
            return;
        }

        let currentIndex = 0;
        setDisplayText('');
        setIsComplete(false);

        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayText(text.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsComplete(true);
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, enabled]);

    return { displayText, isComplete };
};

const ScanInterviewGuide: React.FC<ScanInterviewGuideProps> = ({ onComplete, onQuestionAnswer }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentQuestion = SCAN_QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / SCAN_QUESTIONS.length) * 100;
    
    // Efeito de digitação para a pergunta
    const { displayText: questionText, isComplete: questionComplete } = useTypewriter(
        currentQuestion?.question || '',
        30,
        true
    );

    // Mostrar input após a pergunta ser totalmente exibida
    useEffect(() => {
        if (questionComplete && !showInput) {
            setTimeout(() => {
                setShowInput(true);
            }, 300);
        }
    }, [questionComplete, showInput]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentAnswer.trim() && currentQuestion.required) {
            return;
        }

        setIsSubmitting(true);
        
        // Salvar resposta
        const newAnswers = {
            ...answers,
            [currentQuestion.id]: currentAnswer.trim()
        };
        setAnswers(newAnswers);
        
        // Notificar callback
        onQuestionAnswer(currentQuestion.id, currentAnswer.trim());
        
        // Aguardar animação antes de avançar
        setTimeout(() => {
            if (currentQuestionIndex < SCAN_QUESTIONS.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setCurrentAnswer('');
                setShowInput(false);
            } else {
                // Entrevista completa
                onComplete(newAnswers);
            }
            setIsSubmitting(false);
        }, 500);
    };

    const handleSkip = () => {
        if (currentQuestionIndex < SCAN_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentAnswer('');
            setShowInput(false);
        }
    };

    if (!currentQuestion) return null;

    return (
        <div className="w-full max-w-3xl mx-auto p-6">
            {/* Header com Progresso */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                            {currentQuestion.category}
                        </span>
                        <span className="text-xs text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Pergunta {currentQuestionIndex + 1} de {SCAN_QUESTIONS.length}
                        </span>
                    </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Pergunta com Animação */}
            <div className="mb-6 min-h-[80px]">
                <div className="text-lg font-medium text-on-surface-light dark:text-on-surface-dark leading-relaxed">
                    {questionText}
                    {!questionComplete && (
                        <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse" />
                    )}
                </div>
            </div>

            {/* Input de Resposta */}
            {showInput && (
                <form onSubmit={handleSubmit} className="animate-fade-in">
                    <div className="mb-4">
                        <textarea
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder={currentQuestion.placeholder}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-on-surface-light dark:text-on-surface-dark focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            rows={4}
                            autoFocus
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={(!currentAnswer.trim() && currentQuestion.required) || isSubmitting}
                            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="material-icons-outlined text-lg animate-spin">refresh</span>
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-icons-outlined text-lg">arrow_forward</span>
                                    <span>{currentQuestionIndex < SCAN_QUESTIONS.length - 1 ? 'Próxima Pergunta' : 'Finalizar Entrevista'}</span>
                                </>
                            )}
                        </button>

                        {!currentQuestion.required && (
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="px-4 py-2.5 text-on-surface-secondary-light dark:text-on-surface-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm"
                                disabled={isSubmitting}
                            >
                                Pular
                            </button>
                        )}
                    </div>
                </form>
            )}

            {/* Resumo de Respostas */}
            {Object.keys(answers).length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-medium text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-2">
                        Progresso: {Object.keys(answers).length} de {SCAN_QUESTIONS.length} perguntas respondidas
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScanInterviewGuide;

