@echo off
echo.
echo ========================================
echo   Groovia Dashboard Server
echo ========================================
echo.

:: Definir DATABASE_URL
set DATABASE_URL=postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require

echo [OK] DATABASE_URL configurada
echo      Host: ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech
echo      Database: capsula
echo.

:: Parar processos Node.js
echo Limpando processos antigos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

:: Iniciar servidor
echo.
echo Iniciando servidor...
echo.
npm run server
