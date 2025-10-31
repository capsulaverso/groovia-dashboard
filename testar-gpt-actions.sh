#!/bin/bash

# Script para testar o GPT Action Generator (bash/sh)

echo "========================================"
echo "   TESTE GPT ACTION GENERATOR"
echo "========================================"
echo ""

# URL base
BASE_URL="http://localhost:3001"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${CYAN}1. Health Check...${NC}"
HEALTH=$(curl -s -X GET "$BASE_URL/api/health")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API está rodando!${NC}"
    echo "$HEALTH" | jq .
else
    echo -e "${RED}❌ API não está respondendo. Reinicie o servidor!${NC}"
    echo "Execute: npm run server:no-telemetry"
    exit 1
fi

echo ""

# 2. Testar geração de prompts
echo -e "${CYAN}2. Gerando prompts via GPT...${NC}"
echo -e "${YELLOW}⚠️  IMPORTANTE: Configure OPENAI_API_KEY no .env primeiro!${NC}"
echo ""

curl -X POST "$BASE_URL/api/gpt/generate-prompts" \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "Diagnóstico Guiado",
    "agentPurpose": "Conduzir entrevista estruturada para diagnóstico empresarial completo",
    "context": "Foco em empresas B2B de tecnologia com 10-100 funcionários",
    "exampleInput": "Quais são seus principais desafios?",
    "exampleOutput": "Identifico 3 desafios principais. Vamos aprofundar cada um?"
  }' | jq .

echo ""
echo "========================================"
echo -e "${GREEN}   TESTE CONCLUÍDO!${NC}"
echo "========================================"

