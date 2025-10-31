# Script para reiniciar o servidor completamente

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   REINICIANDO SERVIDOR" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Matar todos os processos Node
Write-Host "1. Parando processos Node existentes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "   ✅ $($nodeProcesses.Count) processo(s) Node parado(s)" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Nenhum processo Node em execução" -ForegroundColor Gray
}

Write-Host ""

# 2. Aguardar 2 segundos
Write-Host "2. Aguardando 2 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host ""

# 3. Iniciar servidor
Write-Host "3. Iniciando servidor..." -ForegroundColor Yellow
Write-Host "   Execute: npm run server:no-telemetry" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor White
Write-Host ""

# Executar servidor
npm run server:no-telemetry

