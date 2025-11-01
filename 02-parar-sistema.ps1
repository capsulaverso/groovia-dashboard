# ========================================
# Script 2: Parar Sistema
# ========================================
# Para todos os processos Node (Frontend + Backend)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PARANDO SISTEMA GROOVIA" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Buscar processos Node
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "🔍 Processos Node encontrados:" -ForegroundColor Yellow
    $nodeProcesses | Format-Table Id, ProcessName, StartTime, @{Label="CPU(s)"; Expression={$_.CPU}}, @{Label="Memória(MB)"; Expression={[math]::Round($_.WorkingSet64/1MB, 2)}} -AutoSize
    
    Write-Host ""
    Write-Host "🛑 Parando processos..." -ForegroundColor Yellow
    
    $count = 0
    foreach ($process in $nodeProcesses) {
        try {
            Stop-Process -Id $process.Id -Force -ErrorAction Stop
            Write-Host "   ✅ Processo $($process.Id) parado" -ForegroundColor Green
            $count++
        } catch {
            Write-Host "   ❌ Erro ao parar processo $($process.Id): $_" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "✅ $count processo(s) parado(s) com sucesso!" -ForegroundColor Green
    
    # Aguardar um pouco para garantir que os processos foram finalizados
    Start-Sleep -Seconds 1
    
    # Verificar se ainda há processos
    $remaining = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($remaining) {
        Write-Host ""
        Write-Host "⚠️  Ainda há processos em execução:" -ForegroundColor Yellow
        $remaining | Format-Table Id, ProcessName -AutoSize
        Write-Host "Tentando forçar parada..." -ForegroundColor Yellow
        $remaining | Stop-Process -Force
        Start-Sleep -Seconds 1
    }
} else {
    Write-Host "ℹ️  Nenhum processo Node em execução" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Sistema parado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Para iniciar novamente, execute:" -ForegroundColor Yellow
Write-Host "   .\01-iniciar-sistema.ps1" -ForegroundColor White
Write-Host ""

