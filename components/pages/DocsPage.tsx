import React from 'react';

const DocsPage: React.FC = () => {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark mb-2">
                    Documentação
                </h1>
                <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                    Aprenda a usar a plataforma Groovia Dashboard
                </p>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="prose dark:prose-invert max-w-none">
                    <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                        Bem-vindo ao Groovia Dashboard
                    </h2>
                    <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-6">
                        O Groovia Dashboard é uma plataforma de inteligência de negócios que utiliza agentes de IA 
                        para ajudar você a tomar decisões estratégicas mais informadas.
                    </p>

                    <h3 className="text-xl font-bold text-on-surface-light dark:text-on-surface-dark mb-3 mt-8">
                        Como Começar
                    </h3>
                    <ol className="space-y-3 text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        <li>1. Faça upload dos seus documentos na seção "Meus Documentos"</li>
                        <li>2. Configure os agentes de IA que você deseja utilizar</li>
                        <li>3. Inicie uma conversa com um agente para obter insights</li>
                        <li>4. Acompanhe o progresso dos seus projetos no Dashboard</li>
                    </ol>

                    <h3 className="text-xl font-bold text-on-surface-light dark:text-on-surface-dark mb-3 mt-8">
                        Agentes Disponíveis
                    </h3>
                    <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-4">
                        Temos diversos agentes especializados para diferentes necessidades:
                    </p>
                    <ul className="space-y-2 text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        <li>• <strong>SCAN CLARITY</strong>: Análise diagnóstica completa</li>
                        <li>• <strong>Market Research</strong>: Pesquisa de mercado e ICP</li>
                        <li>• <strong>Persona Creation</strong>: Criação de personas detalhadas</li>
                        <li>• <strong>Brand Strategy</strong>: Desenvolvimento de estratégia de marca</li>
                        <li>• <strong>Innovation Strategy</strong>: Inovação e diferenciação</li>
                    </ul>

                    <h3 className="text-xl font-bold text-on-surface-light dark:text-on-surface-dark mb-3 mt-8">
                        Precisa de Ajuda?
                    </h3>
                    <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                        Entre em contato com nosso suporte através do email: <a href="mailto:suporte@groovia.com" className="text-primary hover:underline">suporte@groovia.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DocsPage;
