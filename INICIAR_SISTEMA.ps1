# Script PowerShell para inicializar o sistema Groovia

Write-Host "🚀 Iniciando Sistema Groovia Dashboard..." -ForegroundColor Green
Write-Host ""

# Verificar se Docker está rodando
Write-Host "📦 Verificando Docker..." -ForegroundColor Yellow
$dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerProcess) {
    Write-Host "⚠️  Docker Desktop não está rodando!" -ForegroundColor Red
    Write-Host "Tentando iniciar Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
    Write-Host "⏳ Aguardando Docker iniciar (30 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

# Iniciar PostgreSQL
Write-Host ""
Write-Host "🐘 Iniciando PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "⏳ Aguardando PostgreSQL ficar pronto..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Configurar variáveis de ambiente
Write-Host ""
Write-Host "📝 Configurando variáveis de ambiente..." -ForegroundColor Yellow
$envFile = @"
# Database URL
DATABASE_URL=postgresql://groovia:groovia123@localhost:5432/groovia?sslmode=disable

# AI Keys (opcional)
AI_INTEGRATIONS_OPENAI_BASE_URL=https://openai-proxy-replit.worker.projects.divided-grass-brewer.net
AI_INTEGRATIONS_OPENAI_API_KEY=
OPENAI_API_KEY=
GROQ_API_KEY=
GEMINI_API_KEY=
"@

Set-Content -Path .env -Value $envFile
Write-Host "✅ Arquivo .env configurado!" -ForegroundColor Green

# Criar tabelas
Write-Host ""
Write-Host "🗄️  Criando tabelas no banco de dados..." -ForegroundColor Yellow
npm run db:push

# Popular banco
Write-Host ""
Write-Host "🌱 Populando banco com dados iniciais..." -ForegroundColor Yellow
npm run db:seed

Write-Host ""
Write-Host "✅ Sistema configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Credenciais:" -ForegroundColor Cyan
Write-Host "  Email: admin@groovia.com" -ForegroundColor White
Write-Host "  Senha: admin123" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Acesse: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar:" -ForegroundColor Yellow
Write-Host "  Terminal 1: npm run server" -ForegroundColor White
Write-Host "  Terminal 2: npm run dev" -ForegroundColor White
Write-Host ""

