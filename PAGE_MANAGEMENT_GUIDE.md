# Painel de Gerenciamento de Páginas

Este guia descreve o fluxo completo para criação, edição e publicação de páginas no Groovia Dashboard utilizando o editor visual GrapesJS.

## Fluxo geral

1. **Acesso restrito**
   - Apenas usuários com `role = "admin"` conseguem acessar o painel em `/admin/pages` e o editor em `/editor?page=slug`.
   - Todas as requisições ao backend validam `x-session-token`, `x-user-id` e `x-client-id` (enviados automaticamente pelo `useApi`).

2. **Listagem de páginas**
   - Endpoint: `GET /api/pages`
   - Retorna `pages[]` contendo `id`, `name`, `pageKey`, `description`, `updatedAt`, `publishedVersion` e `publishedAt`.
   - O painel exibe esses dados em tabela com ações **Editar** e **Histórico**.

3. **Criação de página**
   - A partir do botão *Criar nova página* é aberto um modal solicitando título, slug e descrição.
   - Endpoint: `POST /api/pages`
   - O backend cria o registro em `pages` (slug normalizado) e opcionalmente a primeira versão (caso um template seja enviado).
   - Após a criação, o frontend atualiza a listagem e redireciona automaticamente para `/editor?page=slug`.

4. **Edição com GrapesJS**
   - O editor é carregado via `React.lazy` apenas quando necessário (`/editor?page=slug`).
   - Controles disponíveis: **Salvar rascunho**, **Publicar** e **Cancelar**, além do campo de **Nota da versão**.
   - IDs dos blocos são prefixados com o slug para evitar colisões com o layout principal.
   - Conteúdo salvo inclui JSON (`projectData`), HTML e CSS separados.

5. **Versionamento**
   - Endpoint: `POST /api/pages/:pageKey`
   - Cada ação **Salvar** ou **Publicar** cria um registro em `page_versions`.
   - Quando a versão é publicada, `pages.published_version_id` é atualizado automaticamente.
   - O painel pode consultar o histórico usando `GET /api/pages/:pageKey`.

6. **Renderização de conteúdo publicado**
   - O componente `PageContentRenderer` utiliza `GET /api/pages/:pageKey?status=published` para obter a última versão publicada.
   - O HTML é injetado sem alterar menus, IDs ou layout do dashboard.
   - O CSS retornado é carregado em `<style id="page-style-{slug}">` e removido ao desmontar o componente.

## Hooks envolvidos

- `useUser`
  - Persiste usuário autenticado (incluindo `sessionToken` e `clientId`).
  - Exponibiliza `isAdmin` para proteger rotas e componentes no frontend.

- `useApi`
  - Centraliza chamadas REST e adiciona automaticamente os cabeçalhos de autenticação requeridos pelo backend.
  - Todas as requisições do painel/ editor passam pelo hook.

## Estrutura de dados

### Tabelas novas

- `pages`
  - `id`, `client_id`, `page_key`, `name`, `description`, `published_version_id`, `created_by`, `updated_by`, timestamps.

- `page_versions`
  - `id`, `page_id`, `client_id`, `user_id`, `version`, `status`, `note`, `content (jsonb)`, `html`, `css`, `created_at`, `published_at`.

### Endpoints principais

| Método | Rota                    | Descrição                              |
|--------|-------------------------|----------------------------------------|
| GET    | `/api/pages`            | Lista páginas (admin)                  |
| POST   | `/api/pages`            | Cria nova página (admin)               |
| GET    | `/api/pages/:pageKey`   | Busca dados e versões (admin/publicado)|
| POST   | `/api/pages/:pageKey`   | Salva versão (admin)                   |

## Boas práticas adotadas

- Editor e painel carregados via *code splitting* para não impactar o bundle principal.
- Validação de slug no backend (`[a-z0-9-]`).
- Prefixo automático de IDs no GrapesJS para evitar conflitos com o DOM global.
- Rotas protegidas tanto no frontend (guardas) quanto no backend (validação de nível admin).
- Histórico de versões acessível direto do painel, sem necessidade de abrir o editor.

## Utilização rápida

1. Logar como administrador (`admin@groovia.com`).
2. Acessar `/admin/pages` para criar ou gerenciar páginas.
3. Após criar uma página, editar em `/editor?page=slug`.
4. Publicar a versão quando desejar disponibilizar o conteúdo.
5. Em qualquer página do dashboard, incluir `PageContentRenderer` apontando para o slug desejado.

