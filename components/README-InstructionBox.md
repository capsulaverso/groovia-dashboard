# InstructionBox Component

## Descrição
Componente reutilizável para exibir instruções, orientações, avisos e novidades em todo o sistema Groovia Dashboard. O usuário pode interagir com botões de ação ou fechar o box.

## Funcionalidades
- ✅ Exibir título e descrição
- ✅ Botões de ação primário e secundário personalizáveis
- ✅ Botão de fechar (X) no canto superior direito
- ✅ 4 variantes visuais: info, warning, success, error
- ✅ Ícone opcional do Material Icons
- ✅ Suporte a tema claro/escuro
- ✅ Estado interno de visibilidade
- ✅ Callbacks personalizáveis para ações

## Como Usar

### Exemplo Básico
```tsx
<InstructionBox
    title="Título da Instrução"
    description="Descrição detalhada da instrução ou aviso."
    primaryButtonText="Começar"
    secondaryButtonText="Mais tarde"
    onPrimaryAction={() => console.log('Ação primária')}
    onSecondaryAction={() => console.log('Ação secundária')}
/>
```

### Exemplo com Variantes
```tsx
// Info (padrão - azul/roxo)
<InstructionBox
    title="Bem-vindo!"
    description="Configure seus agentes de IA."
    variant="info"
    icon="info"
/>

// Warning (amarelo)
<InstructionBox
    title="Atenção!"
    description="Alguns dados precisam ser validados."
    variant="warning"
    icon="warning"
/>

// Success (verde)
<InstructionBox
    title="Sucesso!"
    description="Operação concluída com êxito."
    variant="success"
    icon="check_circle"
/>

// Error (vermelho)
<InstructionBox
    title="Erro"
    description="Ocorreu um problema. Tente novamente."
    variant="error"
    icon="error"
/>
```

### Exemplo Sem Botão de Fechar
```tsx
<InstructionBox
    title="Aviso Importante"
    description="Esta mensagem não pode ser fechada."
    showCloseButton={false}
/>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `title` | `string` | obrigatório | Título do box |
| `description` | `string` | obrigatório | Texto descritivo |
| `primaryButtonText` | `string?` | `"Começar"` | Texto do botão primário |
| `secondaryButtonText` | `string?` | `"Mais tarde"` | Texto do botão secundário |
| `onPrimaryAction` | `() => void` | - | Callback ao clicar no botão primário |
| `onSecondaryAction` | `() => void` | - | Callback ao clicar no botão secundário |
| `onClose` | `() => void` | - | Callback ao fechar o box |
| `showCloseButton` | `boolean` | `true` | Mostrar/ocultar botão de fechar |
| `variant` | `'info' \| 'warning' \| 'success' \| 'error'` | `'info'` | Estilo visual do box |
| `icon` | `string?` | - | Nome do ícone Material Icons |

## Ícones Sugeridos (Material Icons)
- `info` - Informação
- `warning` - Aviso
- `check_circle` - Sucesso
- `error` - Erro
- `notifications` - Notificação
- `lightbulb` - Dica
- `new_releases` - Novidade

## Estilos das Variantes
- **info**: Fundo claro/escuro padrão do sistema
- **warning**: Fundo amarelo claro/escuro
- **success**: Fundo verde claro/escuro
- **error**: Fundo vermelho claro/escuro

## Comportamento
1. O componente possui estado interno de visibilidade (`isVisible`)
2. Ao clicar no X, o estado muda para `false` e o componente desaparece
3. O callback `onClose` é chamado quando o usuário fecha o box
4. Os botões são opcionais - podem ser omitidos ou personalizados
