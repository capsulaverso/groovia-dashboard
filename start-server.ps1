# Script PowerShell para iniciar o servidor com DATABASE_URL configurada

Write-Host "🚀 Iniciando Groovia Dashboard Server..." -ForegroundColor Cyan
Write-Host ""

# Definir DATABASE_URL
$Env:DATABASE_URL = "postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require"

# Verificar se foi definida
if ($Env:DATABASE_URL) {
    Write-Host "✅ DATABASE_URL configurada" -ForegroundColor Green
    Write-Host "   Host: ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech" -ForegroundColor Gray
    Write-Host "   Database: capsula" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ Erro: DATABASE_URL não foi configurada" -ForegroundColor Red
    exit 1
}

# Parar processos Node.js existentes
Write-Host "🧹 Limpando processos antigos..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Iniciar servidor
Write-Host "🔥 Iniciando servidor..." -ForegroundColor Cyan
Write-Host ""
npm run server

