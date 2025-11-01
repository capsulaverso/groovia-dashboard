# ========================================
# Script 3: Status do Sistema
# ========================================
# Verifica status dos servidores e portas

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   STATUS DO SISTEMA GROOVIA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar processos Node
Write-Host "📊 Processos Node:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Format-Table Id, ProcessName, StartTime, @{Label="CPU(s)"; Expression={$_.CPU}}, @{Label="Memória(MB)"; Expression={[math]::Round($_.WorkingSet64/1MB, 2)}} -AutoSize
    Write-Host "✅ $($nodeProcesses.Count) processo(s) em execução" -ForegroundColor Green
} else {
    Write-Host "❌ Nenhum processo Node em execução" -ForegroundColor Red
}

Write-Host ""

# Verificar portas
Write-Host "🔌 Portas em uso:" -ForegroundColor Yellow

# Porta 5000 (Frontend)
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    $pid5000 = $port5000 | Select-Object -First 1 -ExpandProperty OwningProcess
    $process5000 = Get-Process -Id $pid5000 -ErrorAction SilentlyContinue
    Write-Host "   ✅ Porta 5000 (Frontend): EM USO - PID $pid5000" -ForegroundColor Green
    if ($process5000) {
        Write-Host "      Processo: $($process5000.ProcessName)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Porta 5000 (Frontend): LIVRE" -ForegroundColor Red
}

# Porta 3001 (Backend)
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($port3001) {
    $pid3001 = $port3001 | Select-Object -First 1 -ExpandProperty OwningProcess
    $process3001 = Get-Process -Id $pid3001 -ErrorAction SilentlyContinue
    Write-Host "   ✅ Porta 3001 (Backend): EM USO - PID $pid3001" -ForegroundColor Green
    if ($process3001) {
        Write-Host "      Processo: $($process3001.ProcessName)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ Porta 3001 (Backend): LIVRE" -ForegroundColor Red
}

Write-Host ""

# Testar conectividade
Write-Host "🌐 Testando conectividade:" -ForegroundColor Yellow

# Frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ Frontend (5000): OK - Status $($frontendResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend (5000): NÃO RESPONDE" -ForegroundColor Red
}

# Backend
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ Backend (3001): OK" -ForegroundColor Green
} catch {
    try {
        # Tentar qualquer endpoint do backend
        $testResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/agents" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "   ✅ Backend (3001): OK - Status $($testResponse.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Backend (3001): NÃO RESPONDE" -ForegroundColor Red
    }
}

Write-Host ""

# Verificar arquivos importantes
Write-Host "📁 Arquivos do sistema:" -ForegroundColor Yellow

$files = @(
    @{Name="package.json"; Path="package.json"},
    @{Name=".env"; Path=".env"},
    @{Name="node_modules"; Path="node_modules"}
)

foreach ($file in $files) {
    if (Test-Path $file.Path) {
        Write-Host "   ✅ $($file.Name): Existe" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($file.Name): Não encontrado" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Ações disponíveis:" -ForegroundColor Cyan
Write-Host "   .\01-iniciar-sistema.ps1  - Iniciar sistema" -ForegroundColor White
Write-Host "   .\02-parar-sistema.ps1    - Parar sistema" -ForegroundColor White
Write-Host "   .\03-status-sistema.ps1   - Ver status (este script)" -ForegroundColor White
Write-Host ""

