-- Script SQL para criar tabelas de páginas e versões (Page Builder)

-- Tabela de Páginas
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  page_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  published_version_id INTEGER, -- FK para page_versions (adicionada depois)
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(client_id, page_key) -- slug único por cliente
);

-- Tabela de Versões de Páginas
CREATE TABLE IF NOT EXISTS page_versions (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  version INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published'
  note TEXT,
  content JSONB, -- JSON do GrapesJS (projectData)
  html TEXT,
  css TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  published_at TIMESTAMP,
  UNIQUE(page_id, version) -- versão única por página
);

-- Adicionar FK de published_version_id na tabela pages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pages_published_version_id_fkey'
  ) THEN
    ALTER TABLE pages ADD CONSTRAINT pages_published_version_id_fkey 
      FOREIGN KEY (published_version_id) REFERENCES page_versions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pages_client_id ON pages(client_id);
CREATE INDEX IF NOT EXISTS idx_pages_page_key ON pages(page_key);
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_client_id ON page_versions(client_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_status ON page_versions(status);

