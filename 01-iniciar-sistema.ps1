# ========================================
# Script 1: Iniciar Sistema Completo
# ========================================
# Inicia Frontend (Vite) e Backend (Express) em terminais separados

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INICIANDO SISTEMA GROOVIA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se processos já estão rodando
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "⚠️  Processos Node já estão em execução:" -ForegroundColor Yellow
    $nodeProcesses | Format-Table Id, ProcessName, StartTime -AutoSize
    Write-Host "Deseja parar e reiniciar? (S/N): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        Write-Host "Parando processos..." -ForegroundColor Yellow
        $nodeProcesses | Stop-Process -Force
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Cancelado." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "🚀 Iniciando servidores..." -ForegroundColor Green
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: package.json não encontrado!" -ForegroundColor Red
    Write-Host "Execute este script no diretório raiz do projeto." -ForegroundColor Yellow
    exit 1
}

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Aviso: Arquivo .env não encontrado!" -ForegroundColor Yellow
    Write-Host "Crie um arquivo .env com as configurações necessárias." -ForegroundColor Yellow
    Write-Host ""
}

# Iniciar Backend em nova janela
Write-Host "🔧 Iniciando Backend (porta 3001)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🔧 BACKEND - Porta 3001' -ForegroundColor Cyan; npm run server:no-telemetry"

# Aguardar 3 segundos
Start-Sleep -Seconds 3

# Iniciar Frontend em nova janela
Write-Host "🎨 Iniciando Frontend (porta 5000)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🎨 FRONTEND - Porta 5000' -ForegroundColor Green; npm run dev"

# Aguardar mais alguns segundos
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Sistema iniciado!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "📋 Para parar os servidores, execute:" -ForegroundColor Yellow
Write-Host "   .\02-parar-sistema.ps1" -ForegroundColor White
Write-Host ""

