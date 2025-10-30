# ðŸ“¦ PLANO DE MIGRAÃ‡ÃƒO DE BANCO DE DADOS

## Banco Atual (NÃƒO SEGURO)
ðŸ“ Local: Neon (atual)
âš ï¸  PÃºblico na connection string

## OpÃ§Ãµes Seguras:

### 1ï¸âƒ£ NEON (RECOMENDADO - vocÃª jÃ¡ usa)
âœ… Serverless PostgreSQL
âœ… 512 MB grÃ¡tis  
âœ… SSL nativo
âš ï¸  Precisamos criar NOVO projeto seguro

### 2ï¸âƒ£ SUPABASE (Melhor para produÃ§Ã£o)
âœ… PostgreSQL completo
âœ… 500 MB grÃ¡tis
âœ… APIs automÃ¡ticas
âœ… Dashboard admin
âœ… Melhor seguranÃ§a

### 3ï¸âƒ£ RAILWAY
âœ… Simples e rÃ¡pido
âœ… Postgres isolado
ðŸ’µ /mÃªs (crÃ©ditos grÃ¡tis)

## O que fazer:
1. Criar nova conta em um desses serviÃ§os
2. Criar novo banco de dados
3. Exportar dados atuais
4. Importar no novo banco
5. Atualizar .env

## Comandos Ãºteis:
# Exportar schema
npm run db:studio

# Fazer dump dos dados
pg_dump [c connection-string] > backup.sql

# Importar
psql [nova-connection-string] < backup.sql
