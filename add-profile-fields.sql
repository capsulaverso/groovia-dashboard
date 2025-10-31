-- Adicionar campos de perfil completo à tabela users
-- Este script adiciona todos os campos necessários para o perfil profissional

-- 1. Adicionar campos de dados pessoais
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS hash_identifier TEXT UNIQUE;

-- 2. Adicionar campos de dados jurídicos
ALTER TABLE users
ADD COLUMN IF NOT EXISTS legal_name TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS fiscal_address TEXT,
ADD COLUMN IF NOT EXISTS company_type TEXT;

-- 3. Criar índice para busca por hash
CREATE INDEX IF NOT EXISTS idx_users_hash ON users(hash_identifier);

-- 4. Comentários para documentação
COMMENT ON COLUMN users.phone IS 'Telefone de contato do usuário';
COMMENT ON COLUMN users.cpf IS 'CPF do usuário';
COMMENT ON COLUMN users.hash_identifier IS 'Hash único para identificação segura do usuário';
COMMENT ON COLUMN users.legal_name IS 'Razão social da empresa';
COMMENT ON COLUMN users.cnpj IS 'CNPJ da empresa';
COMMENT ON COLUMN users.fiscal_address IS 'Endereço fiscal completo';
COMMENT ON COLUMN users.company_type IS 'Tipo de empresa (LTDA, SA, MEI, etc)';

-- 5. Gerar hash para usuários existentes (se não tiverem)
UPDATE users
SET hash_identifier = 'user_' || LPAD(id::TEXT, 8, '0') || '_' || MD5(email || NOW()::TEXT)
WHERE hash_identifier IS NULL;

