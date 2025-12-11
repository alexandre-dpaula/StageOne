# 🎨 Design System - StageOne

## 📐 Paleta de Cores

### Cores Principais

| Nome | Hex | Uso | Classe Tailwind |
|------|-----|-----|-----------------|
| **Background** | `#2D3250` | Fundo principal | `bg-background` |
| **Foreground/Text** | `#FFFFFF` | Textos principais | `text-foreground` |
| **Card** | `#424669` | Cards e containers | `bg-card` |
| **Placeholder** | `#686F9C` | Placeholders e contrastes | `text-placeholder` |
| **Primary** | `#F7B177` | Botões, destaques, ícones | `bg-primary`, `text-primary` |

### Variações do Primary

```css
primary-50:  #FEF7F2  /* Muito claro */
primary-100: #FDE9DC
primary-200: #FBD3B9
primary-300: #F9BD96
primary-400: #F7B177  /* Principal */
primary-500: #F5A154
primary-600: #F38431  /* Hover states */
primary-700: #E16A0F
primary-800: #B8550C
primary-900: #8F4109  /* Muito escuro */
```

---

## 🔤 Tipografia

### Fonte Principal
**Família:** Raleway
**Fonte:** Google Fonts
**Pesos disponíveis:** 300, 400, 500, 600, 700, 800

### Import
```css
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800&display=swap');
```

### Uso no Tailwind
```jsx
<p className="font-sans">Texto com Raleway</p>
```

---

## 🎯 Aplicação das Cores

### Estrutura de Páginas

```tsx
// Layout principal
<div className="min-h-screen bg-background">
  {/* Navegação */}
  <nav className="bg-card border-b border-card">
    {/* Conteúdo */}
  </nav>

  {/* Conteúdo */}
  <div className="text-foreground">
    {/* Cards */}
    <div className="bg-card rounded-lg p-6">
      {/* Texto */}
      <h2 className="text-foreground font-bold">Título</h2>
      <p className="text-placeholder">Subtítulo</p>
    </div>
  </div>
</div>
```

### Botões

```tsx
// Botão primário
<button className="bg-primary hover:bg-primary-600 text-background px-6 py-3 rounded-lg">
  Ação Principal
</button>

// Botão secundário
<button className="bg-card hover:bg-gray-700 text-foreground px-6 py-3 rounded-lg">
  Ação Secundária
</button>
```

### Inputs e Forms

```tsx
// Input padrão
<input
  className="w-full bg-card text-foreground px-4 py-3 rounded-lg
             placeholder:text-placeholder
             focus:outline-none focus:ring-2 focus:ring-primary"
  placeholder="Digite aqui..."
/>

// Label
<label className="block text-foreground text-sm mb-2">
  Campo
</label>
```

### Cards

```tsx
// Card simples
<div className="bg-card rounded-lg p-6 border border-placeholder">
  <h3 className="text-foreground font-semibold mb-2">Título</h3>
  <p className="text-placeholder text-sm">Descrição</p>
</div>

// Card com hover
<div className="bg-card hover:bg-gray-700 rounded-lg p-6 transition-colors cursor-pointer">
  {/* Conteúdo */}
</div>
```

---

## 🔗 Links e Navegação

```tsx
// Link principal
<Link href="/rota" className="text-primary hover:text-primary-600">
  Link
</Link>

// Link subtle
<Link href="/rota" className="text-foreground hover:text-primary transition-colors">
  Navegação
</Link>
```

---

## 📊 Estados e Feedback

### Sucesso
```tsx
<div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
  <p className="text-green-500">Operação realizada com sucesso!</p>
</div>
```

### Erro
```tsx
<div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
  <p className="text-red-500">Erro ao processar solicitação</p>
</div>
```

### Aviso
```tsx
<div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
  <p className="text-yellow-500">Atenção: verifique os dados</p>
</div>
```

### Info
```tsx
<div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
  <p className="text-blue-500">Informação importante</p>
</div>
```

---

## 🎨 Scrollbar Customizada

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #2D3250; /* background */
}

::-webkit-scrollbar-thumb {
  background: #686F9C; /* placeholder */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #F7B177; /* primary */
}
```

---

## 🌈 Gradientes (Opcional)

```tsx
// Gradiente sutil para destaques
<div className="bg-gradient-to-r from-primary to-primary-600">
  {/* Conteúdo */}
</div>

// Gradiente overlay
<div className="bg-gradient-to-t from-background to-transparent">
  {/* Conteúdo */}
</div>
```

---

## 📱 Responsividade

O design system já está configurado para ser responsivo:

```tsx
// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

// Padding responsivo
<div className="px-4 md:px-6 lg:px-8">
  {/* Conteúdo */}
</div>
```

---

## 🎭 Animações

### Fade In
```tsx
<div className="animate-fade-in">
  {/* Conteúdo */}
</div>
```

### Slide Up
```tsx
<div className="animate-slide-up">
  {/* Conteúdo */}
</div>
```

---

## 📝 Boas Práticas

### ✅ Fazer

- Usar classes do Tailwind configuradas (`bg-background`, `text-primary`, etc.)
- Manter consistência com a paleta definida
- Usar `text-foreground` para textos principais
- Usar `text-placeholder` para textos secundários/sutis
- Usar `bg-card` para containers e cards
- Usar `bg-primary` para botões e destaques

### ❌ Evitar

- Criar cores customizadas fora da paleta
- Usar `bg-black`, `bg-gray-900` diretamente (usar `bg-background` ou `bg-card`)
- Misturar estilos inline com classes Tailwind
- Usar cores hardcoded no código

---

## 🔄 Migração do Design Antigo

### Mapeamento de Cores

| Cor Antiga | Cor Nova | Classe Nova |
|------------|----------|-------------|
| `bg-black` | `#2D3250` | `bg-background` |
| `bg-gray-900` | `#424669` | `bg-card` |
| `bg-gray-800` | `#424669` | `bg-card` |
| `text-gray-400` | `#686F9C` | `text-placeholder` |
| `text-gray-300` | `#FFFFFF` | `text-foreground` |
| `bg-primary-600` | `#F7B177` | `bg-primary` |
| `text-primary-500` | `#F7B177` | `text-primary` |

---

## 🎨 Exemplos de Componentes

### Navbar
```tsx
<nav className="bg-card border-b border-card">
  <div className="max-w-7xl mx-auto px-4 py-4">
    <Link href="/" className="text-primary font-bold text-xl">
      StageOne
    </Link>
  </div>
</nav>
```

### Card de Evento
```tsx
<div className="bg-card rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all">
  <img src={banner} alt={title} className="w-full h-48 object-cover" />
  <div className="p-4">
    <h3 className="text-foreground font-semibold text-lg mb-2">{title}</h3>
    <p className="text-placeholder text-sm mb-4">{subtitle}</p>
    <button className="w-full bg-primary hover:bg-primary-600 text-background py-2 rounded-lg">
      Ver Detalhes
    </button>
  </div>
</div>
```

### Formulário
```tsx
<form className="bg-card rounded-lg p-6 space-y-4">
  <div>
    <label className="block text-foreground text-sm mb-2">Nome</label>
    <input
      type="text"
      className="w-full bg-background text-foreground px-4 py-3 rounded-lg
                 border border-placeholder placeholder:text-placeholder
                 focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="Seu nome"
    />
  </div>

  <button className="w-full bg-primary hover:bg-primary-600 text-background py-3 rounded-lg font-semibold">
    Enviar
  </button>
</form>
```

---

## 📦 Arquivos Modificados

1. **tailwind.config.ts** - Configuração das cores e fonte
2. **app/globals.css** - Import da fonte Raleway e variáveis CSS
3. **Todos os componentes** - Classes atualizadas automaticamente

---

## 🚀 Como Usar

1. As cores já estão configuradas no Tailwind
2. Use as classes diretamente: `bg-primary`, `text-foreground`, etc.
3. A fonte Raleway é aplicada automaticamente
4. Veja exemplos acima para implementação

---

**Design System atualizado em:** Dezembro 2024
**Versão:** 2.0 (Nova Identidade Visual)
