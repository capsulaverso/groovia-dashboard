import React from 'react';

const PrivacyPage: React.FC = () => {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark mb-2">
                    Política de Privacidade
                </h1>
                <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                    Última atualização: 28 de Outubro de 2025
                </p>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="prose dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            1. Coleta de Dados
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Coletamos apenas os dados necessários para fornecer nossos serviços de análise 
                            de inteligência de negócios. Isso inclui:
                        </p>
                        <ul className="space-y-2 text-on-surface-secondary-light dark:text-on-surface-secondary-dark ml-6">
                            <li>• Informações de cadastro (nome, email)</li>
                            <li>• Documentos enviados para análise</li>
                            <li>• Histórico de conversas com agentes de IA</li>
                            <li>• Dados de uso da plataforma</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            2. Uso dos Dados
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Seus dados são utilizados exclusivamente para:
                        </p>
                        <ul className="space-y-2 text-on-surface-secondary-light dark:text-on-surface-secondary-dark ml-6">
                            <li>• Fornecer análises personalizadas através dos agentes de IA</li>
                            <li>• Melhorar nossos serviços e algoritmos</li>
                            <li>• Comunicações relacionadas à sua conta</li>
                            <li>• Cumprimento de obrigações legais</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            3. Retenção de Dados (LGPD)
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-4">
                            Em conformidade com a LGPD (Lei Geral de Proteção de Dados), você tem o direito de:
                        </p>
                        <ul className="space-y-2 text-on-surface-secondary-light dark:text-on-surface-secondary-dark ml-6">
                            <li>• <strong>Definir o prazo de retenção</strong> dos seus documentos</li>
                            <li>• <strong>Solicitar a exclusão</strong> de todos os seus dados a qualquer momento</li>
                            <li>• <strong>Acessar e exportar</strong> todos os dados que temos sobre você</li>
                            <li>• <strong>Corrigir</strong> informações incorretas ou desatualizadas</li>
                        </ul>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark mt-4">
                            Os documentos são automaticamente excluídos após o prazo definido por você 
                            na seção "Meus Documentos".
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            4. Segurança
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Implementamos medidas de segurança técnicas e organizacionais para proteger 
                            seus dados, incluindo criptografia end-to-end, backups regulares e controle 
                            de acesso rigoroso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            5. Seus Direitos
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Para exercer seus direitos relacionados aos dados pessoais, entre em contato 
                            através do email: <a href="mailto:privacidade@groovia.com" className="text-primary hover:underline">
                            privacidade@groovia.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
