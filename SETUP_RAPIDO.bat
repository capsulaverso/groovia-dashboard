@echo off
chcp 65001 >nul
echo ╔══════════════════════════════════════════════════════════════╗
echo ║     🚀 GROOVIA DASHBOARD - Setup Automático                 ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo 📝 CONFIGURANDO BANCO DE DADOS...
echo.

REM Criar .env se não existir
if not exist .env (
    echo Criando arquivo .env...
    (
        echo # Database URL - Você precisa configurar isso!
        echo DATABASE_URL=postgresql://user:password@localhost:5432/groovia?sslmode=require
        echo.
        echo # AI Keys ^(opcional^)
        echo AI_INTEGRATIONS_OPENAI_BASE_URL=https://openai-proxy-replit.worker.projects.divided-grass-brewer.net
        echo AI_INTEGRATIONS_OPENAI_API_KEY=
        echo OPENAI_API_KEY=
        echo GROQ_API_KEY=
        echo GEMINI_API_KEY=
    ) > .env
)

echo.
echo ══════════════════════════════════════════════════════════════
echo    ⚠️  IMPORTANTE: Configure o banco de dados!              ╠
echo ══════════════════════════════════════════════════════════════
echo.
echo Escolha uma opção:
echo.
echo 1. Usar Neon Database (Recomendado)
echo    - Abra: https://console.neon.tech
echo    - Crie um projeto
echo    - Copie a DATABASE_URL
echo    - Edite o arquivo .env
echo.
echo 2. Usar Docker
echo    - Certifique-se que Docker Desktop está rodando
echo    - Execute: docker-compose up -d
echo    - Use DATABASE_URL=postgresql://groovia:groovia123@localhost:5432/groovia
echo.
echo 3. Editar .env manualmente agora
echo.
set /p opcao="Digite sua opção (1-3): "

if "%opcao%"=="3" (
    start notepad .env
    echo.
    echo Arquivo .env aberto. Configure a DATABASE_URL e pressione qualquer tecla...
    pause >nul
)

echo.
echo Executando configuração do banco...
echo.
npm run db:push
echo.
npm run db:seed
echo.
echo ✅ Configuração concluída!
echo.
echo Para iniciar o sistema:
echo   Terminal 1: npm run server
echo   Terminal 2: npm run dev
echo.
pause

