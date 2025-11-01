# Script para testar o GPT Action Generator no PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TESTE GPT ACTION GENERATOR" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# URL base
$baseUrl = "http://localhost:3001"

# Função para fazer request POST
function Test-Endpoint {
    param(
        [string]$Url,
        [hashtable]$Body
    )
    
    Write-Host "Testando: $Url" -ForegroundColor Yellow
    
    try {
        $jsonBody = $Body | ConvertTo-Json
        $response = Invoke-RestMethod -Uri $Url -Method Post -Body $jsonBody -ContentType "application/json"
        
        Write-Host "✅ Sucesso!" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 10
    }
    catch {
        Write-Host "❌ Erro: $_" -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host "Detalhes: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# 1. Testar Health Check
Write-Host "1. Health Check..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Write-Host "✅ API está rodando!" -ForegroundColor Green
    $health | ConvertTo-Json
}
catch {
    Write-Host "❌ API não está respondendo. Reinicie o servidor!" -ForegroundColor Red
    Write-Host "Execute: npm run server:no-telemetry" -ForegroundColor Yellow
    exit
}

Write-Host ""

# 2. Testar geração de prompts (sem salvar)
Write-Host "2. Gerando prompts via GPT..." -ForegroundColor Cyan
Write-Host "⚠️  IMPORTANTE: Configure OPENAI_API_KEY no .env primeiro!" -ForegroundColor Yellow
Write-Host ""

$promptRequest = @{
    agentType = "Diagnóstico Guiado"
    agentPurpose = "Conduzir entrevista estruturada para diagnóstico empresarial completo"
    context = "Foco em empresas B2B de tecnologia com 10-100 funcionários"
    exampleInput = "Quais são seus principais desafios?"
    exampleOutput = "Identifico 3 desafios principais. Vamos aprofundar cada um?"
}

Test-Endpoint -Url "$baseUrl/api/gpt/generate-prompts" -Body $promptRequest

# 3. Exemplo de uso com agente existente
Write-Host "3. Para gerar regras para um agente específico:" -ForegroundColor Cyan
Write-Host "   POST /api/agents/1/generate-rules" -ForegroundColor White
Write-Host "   (Substitua 1 pelo ID do agente)" -ForegroundColor Gray
Write-Host ""

# 4. Exemplo de teste de regras
Write-Host "4. Para testar regras de um agente:" -ForegroundColor Cyan
Write-Host "   POST /api/agents/1/test-rules" -ForegroundColor White
Write-Host "   Body: { message: 'Olá, preciso de ajuda' }" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TESTE CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

