# 🎨 DESIGN SYSTEM - Padrão Inegociável

## 📋 ESPECIFICAÇÕES

### Tipografia
- **Fonte**: Poppins
- **Títulos**: 18px, Bold (700)
- **Corpo**: 14px, Light (300)

---

## 🚀 IMPLEMENTAÇÃO

### 1. Configuração Global (já aplicada)

O padrão foi configurado em `index.html` e `design-system.css`:

```css
/* Títulos */
.text-title, h1-h6 {
    font-size: 18px;
    font-weight: 700;
    font-family: 'Poppins', sans-serif;
}

/* Corpo de texto */
.text-body, p, span, div, a, button {
    font-size: 14px;
    font-weight: 300;
    font-family: 'Poppins', sans-serif;
}
```

### 2. Classes Utilitárias Tailwind

Agora você pode usar as classes Tailwind:

```html
<!-- Títulos -->
<h1 class="text-title">Meu Título</h1>
<div class="text-[18px] font-bold">Título Alternativo</div>

<!-- Corpo de Texto -->
<p class="text-body">Meu texto descritivo</p>
<div class="text-[14px] font-light">Texto Alternativo</div>
```

### 3. Aplicação Automática

O padrão é aplicado **automaticamente** em:
- ✅ Todos os headings (h1-h6)
- ✅ Todos os parágrafos
- ✅ Todos os spans e divs
- ✅ Todos os botões e inputs
- ✅ Todo o corpo da aplicação

---

## 📖 EXEMPLOS DE USO

### Em Componentes React

```tsx
// Exemplo de Card
<div className="p-6">
    <h2 className="text-title mb-2">
        SCAN CLARITY
    </h2>
    <p className="text-body">
        Descrição do card em texto body
    </p>
</div>

// Exemplo com Tailwind diretamente
<div className="text-[18px] font-bold">
    Título com 18px Bold
</div>
<div className="text-[14px] font-light">
    Texto com 14px Light
</div>
```

### Em HTML Puro

```html
<!-- Automático -->
<h1>Título</h1> <!-- 18px Bold -->

<p>Texto descritivo</p> <!-- 14px Light -->

<!-- Com classes -->
<div class="text-title">Meu Título</div>
<div class="text-body">Meu Texto</div>
```

---

## 🎯 REGRAS

### ✅ PERMITIDO
- Usar `.text-title` para títulos
- Usar `.text-body` para textos
- Usar `text-[18px]` com `font-bold` (Tailwind)
- Usar `text-[14px]` com `font-light` (Tailwind)
- Títulos automáticos em elementos h1-h6
- Textos automáticos em p, span, div

### ❌ PROIBIDO
- Usar outros tamanhos de fonte (18px ou 14px apenas)
- Usar outras fontes (apenas Poppins)
- Usar outros weights (700 para títulos, 300 para corpo)
- Desviar do padrão estabelecido

---

## 🔄 MANUTENÇÃO

### Como Preservar o Padrão

1. **NUNCA remova** o link de `design-system.css` no `index.html`
2. **MANTENHA** a configuração do Tailwind em `index.html`
3. **USE** as classes utilitárias `.text-title` e `.text-body`
4. **RESPEITE** os pesos de fonte (Bold para títulos, Light para corpo)

### Alterações Permitidas

✅ Ajustes de cores
✅ Ajustes de espaçamento
✅ Ajustes de layout
✅ Melhorias de UI/UX

❌ Alterar tamanhos de fonte
❌ Alterar pesos de fonte
❌ Alterar a família de fonte

---

## 🧪 TESTE

Acesse: http://localhost:5000

Verifique:
- ✅ Títulos em 18px Bold
- ✅ Textos em 14px Light
- ✅ Fonte Poppins em tudo
- ✅ Consistência visual

---

## 📝 CHANGELOG

### 2024-10-28 - Implementação Inicial
- ✅ Fonte Poppins configurada (pesos 300 e 700)
- ✅ Títulos: 18px, Bold
- ✅ Corpo: 14px, Light
- ✅ Design System global implementado
- ✅ Classes utilitárias criadas
- ✅ Aplicação automática em todos os elementos

---

## 🎨 ARQUIVOS AFETADOS

- `index.html` - Configuração Tailwind e link CSS
- `design-system.css` - Sistema de design global
- Todos os componentes - Padrão aplicado automaticamente

---

## ⚠️ IMPORTANTE

Este padrão é **INEGOCIÁVEL** e não pode ser alterado sem autorização expressa.

Mudanças nos tamanhos, pesos ou família de fonte são **PROIBIDAS**.

Exceptions: Nenhuma permitida.

