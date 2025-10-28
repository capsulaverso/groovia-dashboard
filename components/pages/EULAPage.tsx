import React from 'react';

const EULAPage: React.FC = () => {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-on-surface-light dark:text-on-surface-dark mb-2">
                    Termos de Uso (EULA)
                </h1>
                <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                    End User License Agreement - Última atualização: 28 de Outubro de 2025
                </p>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="prose dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            1. Aceitação dos Termos
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Ao acessar e usar o Groovia Dashboard, você concorda em cumprir e estar 
                            vinculado aos seguintes termos e condições de uso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            2. Licença de Uso
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            A Groovia concede a você uma licença limitada, não exclusiva, intransferível 
                            e revogável para usar a plataforma de acordo com estes termos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            3. Uso Aceitável
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-4">
                            Você concorda em NÃO:
                        </p>
                        <ul className="space-y-2 text-on-surface-secondary-light dark:text-on-surface-secondary-dark ml-6">
                            <li>• Usar a plataforma para fins ilegais ou não autorizados</li>
                            <li>• Tentar obter acesso não autorizado aos sistemas</li>
                            <li>• Interferir ou interromper o funcionamento da plataforma</li>
                            <li>• Fazer engenharia reversa ou copiar qualquer parte do software</li>
                            <li>• Usar a plataforma para distribuir malware ou conteúdo nocivo</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            4. Propriedade Intelectual
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Todo o conteúdo, recursos e funcionalidades da plataforma são propriedade 
                            exclusiva da Groovia e são protegidos por leis de direitos autorais, marcas 
                            registradas e outras leis de propriedade intelectual.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            5. Limitação de Responsabilidade
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            A Groovia não será responsável por quaisquer danos indiretos, incidentais, 
                            especiais ou consequenciais resultantes do uso ou incapacidade de usar a plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            6. Rescisão
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Podemos rescindir ou suspender sua conta e acesso à plataforma imediatamente, 
                            sem aviso prévio, por violação destes termos ou por qualquer outro motivo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            7. Alterações nos Termos
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                            Notificaremos você sobre mudanças significativas através do email cadastrado.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-on-surface-light dark:text-on-surface-dark mb-4">
                            8. Contato
                        </h2>
                        <p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
                            Para questões sobre estes termos, entre em contato: <a href="mailto:legal@groovia.com" className="text-primary hover:underline">
                            legal@groovia.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default EULAPage;
