# Groovia Dashboard

Dashboard moderno com tema claro/escuro desenvolvido em React + TypeScript + Vite.

## 🚀 Deploy Rápido

### Opção 1: Vercel (Recomendado)
1. Faça push do código para GitHub
2. Conecte o repositório no [Vercel](https://vercel.com)
3. Deploy automático a cada push

### Opção 2: GitHub Pages
1. Execute `npm run build`
2. Faça push da pasta `dist` para branch `gh-pages`
3. Configure GitHub Pages nas configurações do repositório

### Opção 3: Netlify
1. Conecte o repositório no [Netlify](https://netlify.com)
2. Configure build command: `npm run build`
3. Configure publish directory: `dist`

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## ✨ Funcionalidades

- ✅ Tema claro/escuro com persistência
- ✅ Interface responsiva
- ✅ Componentes modulares
- ✅ TypeScript
- ✅ Hot reload em desenvolvimento

## 📁 Estrutura

```
├── components/          # Componentes React
├── hooks/              # Hooks customizados
├── dist/               # Build de produção
├── index.html          # Template HTML
├── vite.config.ts      # Configuração Vite
└── package.json        # Dependências
```

## 🔧 Configuração

O projeto usa Tailwind CSS para estilização e Material Icons para ícones.

### Variáveis de Ambiente
Crie um arquivo `.env` com:
```
GEMINI_API_KEY=sua_chave_aqui
```