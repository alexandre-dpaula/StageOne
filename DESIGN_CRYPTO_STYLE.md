# 🎨 Design System - Crypto/Fintech Style

## 📐 Paleta de Cores (Inspirada em Crypto/Fintech)

### Cores Principais

| Nome | Hex | Uso | Classe Tailwind |
|------|-----|-----|-----------------|
| **Background** | `#0A0B0D` | Fundo principal (preto profundo) | `bg-background` |
| **Foreground** | `#FFFFFF` | Textos principais (branco puro) | `text-foreground` |
| **Card** | `#1A1D23` | Cards e containers | `bg-card` |
| **Card Hover** | `#222731` | Estado hover dos cards | `bg-card-hover` |
| **Placeholder** | `#71767D` | Textos secundários | `text-placeholder` |
| **Border** | `#2D3139` | Bordas e separadores | `border-border` |
| **Primary** | `#C4F82A` | Destaque principal (verde neon) | `bg-primary` / `text-primary` |

### Cores Accent (Extras)

| Nome | Hex | Uso |
|------|-----|-----|
| **Green** | `#00FF88` | Sucesso, positivo |
| **Blue** | `#00B8FF` | Informação, neutro |
| **Purple** | `#B580FF` | Premium, especial |

### Variações do Primary (Verde Neon)

```
primary-50:  #F5FFDD  /* Muito claro */
primary-100: #EEFFBB
primary-200: #E4FF88
primary-300: #D9FF55
primary-400: #C4F82A  /* Principal - Verde Neon */
primary-500: #B0E624
primary-600: #9FD41F
primary-700: #8EC21A
primary-800: #7DB015
primary-900: #6C9E10  /* Muito escuro */
```

---

## 🎯 Elementos Visuais

### 1. Cards com Glassmorphism

```tsx
// Card com efeito glass
<div className="glass rounded-2xl p-6">
  <h3 className="text-foreground font-bold">Título</h3>
  <p className="text-placeholder">Conteúdo</p>
</div>

// Card sólido
<div className="bg-card border border-border rounded-2xl p-6 shadow-card hover:bg-card-hover transition-all">
  <h3 className="text-foreground font-bold">Título</h3>
  <p className="text-placeholder">Conteúdo</p>
</div>
```

### 2. Botões com Glow Effect

```tsx
// Botão primário com glow
<button className="bg-primary text-background px-8 py-4 rounded-full font-bold
                   hover:shadow-glow-lg hover:scale-105 transition-all duration-300">
  Explore Now
</button>

// Botão secundário
<button className="bg-card border-2 border-primary text-primary px-8 py-4 rounded-full font-bold
                   hover:bg-primary hover:text-background transition-all duration-300">
  Learn More
</button>

// Botão com ícone
<button className="bg-primary text-background w-14 h-14 rounded-full flex items-center justify-center
                   hover:shadow-glow-md hover:scale-110 transition-all">
  <ArrowIcon className="w-6 h-6" />
</button>
```

### 3. Textos com Efeito Neon

```tsx
// Título principal
<h1 className="text-6xl font-bold text-foreground">
  Best crypto
  <span className="text-primary text-glow"> investing platform </span>
  for your future.
</h1>

// Subtítulo
<p className="text-placeholder text-lg">
  Keep your money safe with our <span className="text-foreground">trusted platform</span>
</p>
```

### 4. Cards Numerados (como na referência)

```tsx
// Card 01, 02, 03
<div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
  {/* Número grande ao fundo */}
  <div className="absolute -top-4 -right-4 text-8xl font-bold text-border/30">
    01.
  </div>

  {/* Conteúdo */}
  <div className="relative z-10">
    <span className="text-primary text-sm font-bold">01.</span>
    <h3 className="text-foreground font-bold text-xl mt-2">
      Service for Any Level of Expertise.
    </h3>
    <p className="text-placeholder mt-3">
      Polkadot unites and secures a growing ecosystem...
    </p>
  </div>
</div>

// Card destaque (02 verde)
<div className="bg-primary text-background rounded-2xl p-6 shadow-glow-lg">
  <span className="font-bold">02.</span>
  <h3 className="font-bold text-2xl mt-2">Industry best practices.</h3>
  <p className="mt-3 opacity-90">
    Polkadot unites and secures...
  </p>
  <button className="mt-4 flex items-center gap-2 font-bold">
    Learn More →
  </button>
</div>
```

### 5. Estatísticas/Métricas

```tsx
// Box de métrica
<div className="bg-card border border-border rounded-xl p-4">
  <div className="flex items-center gap-2 mb-2">
    <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow"></div>
    <span className="text-placeholder text-sm">Realtime Data</span>
  </div>
  <p className="text-foreground text-3xl font-bold">168K+</p>
  <p className="text-placeholder text-sm">Realtime Users</p>
</div>

// Gráfico simples
<div className="bg-card border border-border rounded-xl p-4">
  <p className="text-primary text-2xl font-bold">$4,528 USD</p>
  <p className="text-accent-green text-sm">↑ +36.66%</p>
  {/* SVG ou canvas para gráfico */}
</div>
```

### 6. Ícones Circulares com Avatares

```tsx
// Avatar group
<div className="flex -space-x-3">
  <div className="w-12 h-12 rounded-full border-2 border-background overflow-hidden">
    <img src="/avatar1.jpg" alt="User" />
  </div>
  <div className="w-12 h-12 rounded-full border-2 border-background overflow-hidden">
    <img src="/avatar2.jpg" alt="User" />
  </div>
  <div className="w-12 h-12 rounded-full border-2 border-background bg-primary flex items-center justify-center text-background font-bold">
    +5
  </div>
</div>
```

### 7. Inputs Modernos

```tsx
// Input com estilo crypto
<input
  className="w-full bg-card text-foreground px-6 py-4 rounded-xl
             border border-border placeholder:text-placeholder
             focus:outline-none focus:border-primary focus:shadow-glow-sm
             transition-all"
  placeholder="Enter your email..."
/>

// Input com ícone
<div className="relative">
  <input
    className="w-full bg-card text-foreground pl-14 pr-6 py-4 rounded-xl
               border border-border focus:border-primary focus:shadow-glow-sm"
    placeholder="Search..."
  />
  <div className="absolute left-4 top-1/2 -translate-y-1/2">
    <SearchIcon className="w-6 h-6 text-placeholder" />
  </div>
</div>
```

### 8. Badges e Tags

```tsx
// Badge success
<span className="px-4 py-2 rounded-full text-sm font-bold
               bg-accent-green/10 text-accent-green border border-accent-green/30">
  Active
</span>

// Badge info
<span className="px-4 py-2 rounded-full text-sm font-bold
               bg-accent-blue/10 text-accent-blue border border-accent-blue/30">
  New
</span>

// Badge premium
<span className="px-4 py-2 rounded-full text-sm font-bold
               bg-accent-purple/10 text-accent-purple border border-accent-purple/30">
  Premium
</span>
```

---

## 🎨 Efeitos e Animações

### Glow Effects

```tsx
// Botão com glow
<button className="bg-primary text-background px-6 py-3 rounded-full
                   shadow-glow-sm hover:shadow-glow-lg transition-all">
  Click me
</button>

// Card com glow
<div className="bg-card border border-primary/30 rounded-2xl p-6
                shadow-glow-md hover:shadow-glow-lg transition-all">
  {/* Content */}
</div>
```

### Animações

```tsx
// Pulse lento
<div className="w-4 h-4 rounded-full bg-primary animate-pulse-slow"></div>

// Glow animado
<button className="animate-glow">Button</button>

// Fade in
<div className="animate-fade-in">Content</div>

// Slide up
<div className="animate-slide-up">Content</div>
```

---

## 🎯 Componentes Completos

### Hero Section

```tsx
<section className="min-h-screen bg-background px-4 py-20">
  <div className="max-w-7xl mx-auto">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Left content */}
      <div>
        <p className="text-primary text-sm font-bold uppercase tracking-wider mb-4">
          Keep your money safe
        </p>
        <h1 className="text-6xl font-bold text-foreground mb-4">
          Best crypto
          <span className="text-primary text-glow"> investing platform </span>
          for your future.
        </h1>

        {/* Avatars + Stats */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex -space-x-3">
            {/* Avatars */}
          </div>
          <div>
            <p className="text-foreground font-bold">168K+</p>
            <p className="text-placeholder text-sm">Realtime Users</p>
          </div>
        </div>

        {/* CTA */}
        <button className="bg-primary text-background px-8 py-4 rounded-full font-bold
                           hover:shadow-glow-lg hover:scale-105 transition-all flex items-center gap-2">
          <span>Explore now</span>
          <ArrowIcon />
        </button>

        <p className="text-placeholder mt-6">
          Polkadot unites and secures a growing ecosystem of specialized blockchains...
        </p>
      </div>

      {/* Right content - Phone mockups */}
      <div className="relative">
        {/* Phone images with decorative elements */}
      </div>
    </div>
  </div>
</section>
```

### Features Grid

```tsx
<section className="py-20">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-5xl font-bold text-foreground mb-4">
      Your <span className="text-primary">trusted</span> partner of
    </h2>
    <h2 className="text-5xl font-bold text-foreground mb-12">
      crypto<span className="text-placeholder">currency</span>.
    </h2>

    <div className="grid md:grid-cols-3 gap-6">
      {/* Card 01 */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <span className="text-primary font-bold">01.</span>
        <h3 className="text-foreground font-bold text-xl mt-3">
          Service for Any Level of Expertise.
        </h3>
        <p className="text-placeholder mt-3">
          Description text here...
        </p>
      </div>

      {/* Card 02 - Highlighted */}
      <div className="bg-primary text-background rounded-2xl p-6 shadow-glow-lg">
        <span className="font-bold">02.</span>
        <h3 className="font-bold text-xl mt-3">
          Industry best practices.
        </h3>
        <p className="mt-3 opacity-90">
          Description text here...
        </p>
        <button className="mt-4 flex items-center gap-2 font-bold hover:gap-4 transition-all">
          Learn More →
        </button>
      </div>

      {/* Card 03 */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <span className="text-primary font-bold">03.</span>
        <h3 className="text-foreground font-bold text-xl mt-3">
          Protected by Insurance.
        </h3>
        <p className="text-placeholder mt-3">
          Description text here...
        </p>
      </div>
    </div>
  </div>
</section>
```

---

## 🎯 Hierarquia Visual

```
Mais Escuro → Mais Claro
------------------------------
#0A0B0D (Background) → Fundo geral
#1A1D23 (Card) → Cards, containers
#222731 (Card-hover) → Hover states
#2D3139 (Border) → Bordas
#71767D (Placeholder) → Textos secundários
#C4F82A (Primary) → Destaques, CTAs
#FFFFFF (Foreground) → Textos principais
```

---

## ✅ Checklist do Design

- [ ] Fundo preto profundo (#0A0B0D)
- [ ] Cards com bordas sutis
- [ ] Verde neon para destaques (#C4F82A)
- [ ] Efeitos de glow nos botões principais
- [ ] Bordas arredondadas (rounded-2xl, rounded-full)
- [ ] Transições suaves (transition-all)
- [ ] Fonte Raleway em todos os textos
- [ ] Glassmorphism em overlays
- [ ] Ícones circulares
- [ ] Hover effects com scale e shadow

---

**Design System Crypto/Fintech - Versão 3.0**
**Última atualização:** Dezembro 2024
