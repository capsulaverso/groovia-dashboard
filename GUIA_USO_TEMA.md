# 🎨 GUIA DE USO - TEMA CLARO E ESCURO

**Para:** Desenvolvedores e Designers  
**Data:** 29/10/2025

---

## 🚀 COMO USAR O TEMA

### 1️⃣ No Usuário Final

1. Acesse o sistema: `http://localhost:5000`
2. Faça login
3. Localize o **botão circular** no topo direito da sidebar
4. Clique para alternar entre:
   - 🌞 **Modo Claro** (ícone lua)
   - 🌙 **Modo Escuro** (ícone sol)

**Nota:** A preferência é salva automaticamente e persiste entre sessões.

---

## 💻 PARA DESENVOLVEDORES

### Classes Tailwind para Tema

#### Fundos
```tsx
// Fundo principal da página
<div className="bg-background-light dark:bg-background-dark">

// Superfícies elevadas (cards, modais)
<div className="bg-surface-light dark:bg-surface-dark">

// Fundo de inputs
<input className="bg-white dark:bg-gray-800" />
```

#### Textos
```tsx
// Texto principal (títulos, conteúdo importante)
<h1 className="text-on-surface-light dark:text-on-surface-dark">

// Texto secundário (descrições, legendas)
<p className="text-on-surface-secondary-light dark:text-on-surface-secondary-dark">

// Texto em cor fixa (não muda com tema)
<span className="text-gray-600">
```

#### Bordas
```tsx
// Bordas adaptáveis ao tema
<div className="border border-gray-300 dark:border-gray-700">

// Divisores
<hr className="border-gray-200 dark:border-gray-800" />
```

#### Botões
```tsx
// Botão primário (sempre verde)
<button className="bg-primary text-white hover:bg-primary/90">
  Ação Principal
</button>

// Botão secundário (adaptável)
<button className="bg-gray-200 dark:bg-gray-700 text-on-surface-light dark:text-on-surface-dark">
  Ação Secundária
</button>
```

---

## 📋 TABELA DE REFERÊNCIA RÁPIDA

| Uso | Classe Light | Classe Dark | Resultado |
|-----|--------------|-------------|-----------|
| **Fundo página** | `bg-background-light` | `bg-background-dark` | Fundo principal |
| **Card/Modal** | `bg-surface-light` | `bg-surface-dark` | Superfície elevada |
| **Título** | `text-on-surface-light` | `text-on-surface-dark` | Texto principal |
| **Descrição** | `text-on-surface-secondary-light` | `text-on-surface-secondary-dark` | Texto secundário |
| **Borda** | `border-gray-300` | `border-gray-700` | Divisor sutil |
| **Input** | `bg-white` | `bg-gray-800` | Campo de entrada |
| **Botão Primário** | `bg-primary` | `bg-primary` | Verde (#00FF7F) |

---

## 🎨 VALORES HEX DAS CORES

### Modo Claro 🌞
```css
background-light:             #F3F4F6
surface-light:                #FFFFFF
on-surface-light:             #1F2937
on-surface-secondary-light:   #6B7280
border-light:                 #D1D5DB (#E5E7EB gray-300)
```

### Modo Escuro 🌙
```css
background-dark:              #0F1419
surface-dark:                 #1A1F2E
on-surface-dark:              #F9FAFB
on-surface-secondary-dark:    #9CA3AF
border-dark:                  #374151 (#4B5563 gray-700)
```

### Universal
```css
primary:                      #00FF7F (verde neon)
```

---

## 🔧 PROGRAMATICAMENTE

### Hook useTheme
```tsx
import { useTheme } from '../hooks/useTheme';

function MeuComponente() {
  const { theme, toggleTheme } = useTheme();
  
  // theme = 'light' | 'dark'
  
  return (
    <div>
      <p>Tema atual: {theme}</p>
      <button onClick={toggleTheme}>
        Alternar Tema
      </button>
    </div>
  );
}
```

### Verificar Tema Atual
```tsx
// No componente
const { theme } = useTheme();

if (theme === 'dark') {
  // Lógica específica para modo escuro
}

// Ou usar diretamente no JSX
<div>
  {theme === 'dark' ? (
    <DarkModeComponent />
  ) : (
    <LightModeComponent />
  )}
</div>
```

### Forçar um Tema
```tsx
const { setTheme } = useTheme();

// Forçar modo escuro
setTheme('dark');

// Forçar modo claro
setTheme('light');
```

---

## 🎯 EXEMPLOS PRÁTICOS

### Exemplo 1: Card Completo
```tsx
<div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
  <h2 className="text-lg font-bold text-on-surface-light dark:text-on-surface-dark mb-2">
    Título do Card
  </h2>
  <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark mb-4">
    Descrição do conteúdo do card que se adapta ao tema.
  </p>
  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
    Ação
  </button>
</div>
```

### Exemplo 2: Form Input
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-on-surface-light dark:text-on-surface-dark">
    Email
  </label>
  <input
    type="email"
    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-on-surface-light dark:text-on-surface-dark focus:border-primary focus:outline-none"
    placeholder="seu@email.com"
  />
</div>
```

### Exemplo 3: Lista com Itens
```tsx
<ul className="space-y-2">
  {items.map(item => (
    <li 
      key={item.id}
      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <h3 className="font-medium text-on-surface-light dark:text-on-surface-dark">
        {item.title}
      </h3>
      <p className="text-sm text-on-surface-secondary-light dark:text-on-surface-secondary-dark">
        {item.description}
      </p>
    </li>
  ))}
</ul>
```

---

## ⚠️ BOAS PRÁTICAS

### ✅ FAZER
- Sempre usar classes `dark:` junto com classes normais
- Testar componentes em ambos os temas
- Usar variáveis do tema (`primary`, `surface-light`, etc)
- Manter contraste adequado (WCAG AA mínimo)

### ❌ NÃO FAZER
- Hardcodar cores (ex: `style={{ color: '#333' }}`)
- Esquecer do `dark:` em novos componentes
- Usar cores que funcionam só em um tema
- Depender de imagens com fundo fixo

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Tema não muda?
1. Verifique se o hook `useTheme` está importado
2. Confirme que o HTML tem a classe `.dark`
3. Limpe o cache do navegador
4. Verifique localStorage: `localStorage.getItem('theme')`

### Cores erradas?
1. Confirme que está usando classes `dark:` corretas
2. Verifique a ordem das classes (specificity)
3. Inspecione o elemento no navegador
4. Veja se há estilos inline sobrescrevendo

### Componente não responde ao tema?
1. Verifique se usa `style` inline com cores fixas
2. Substitua por classes Tailwind
3. Use as variáveis do tema

---

## 📞 SUPORTE

**Documentação Completa:** `TEMA_CORES_CORRIGIDO.md`  
**Implementação Técnica:** `TEMA_IMPLEMENTADO.md`  
**Arquivo Principal:** `index.html` (linhas 16-26)  
**Hook:** `hooks/useTheme.ts`  
**Componente Toggle:** `components/Sidebar.tsx` (ThemeSelector)

---

**Versão:** 1.0  
**Última atualização:** 29/10/2025

