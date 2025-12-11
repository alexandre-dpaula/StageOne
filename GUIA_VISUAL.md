# 🎨 Guia Visual - Aplicação das Cores

## 📋 Mapa de Cores por Elemento

### 🏗️ Estrutura Base

```tsx
// Fundo principal da página
<div className="min-h-screen bg-background">
  // Cor: #2D3250 (Background)
</div>
```

### 🧭 Navegação (Navbar)

```tsx
// Navbar com borda sutil
<nav className="bg-card border-b border-placeholder">
  <Link className="text-primary">StageOne</Link>
  // Navbar: #424669 (Card)
  // Borda: #686F9C (Placeholder)
  // Link: #F7B177 (Primary)
</nav>
```

### 📦 Cards e Containers

```tsx
// Card padrão
<div className="bg-card rounded-lg p-6">
  <h2 className="text-foreground font-bold">Título</h2>
  <p className="text-placeholder text-sm">Subtítulo</p>
  // Background: #424669 (Card)
  // Título: #FFFFFF (Foreground)
  // Subtítulo: #686F9C (Placeholder)
</div>
```

### 🔘 Botões

```tsx
// Botão Primário (Destaque)
<button className="bg-primary hover:bg-primary-600 text-background px-6 py-3 rounded-lg">
  Criar Evento
  // Background: #C4F82A (Primary - Verde Neon)
  // Hover: #9FD41F (Primary-600)
  // Texto: #0A0B0D (Background - Preto)
</button>

// Botão Secundário
<button className="bg-card hover:bg-placeholder text-foreground px-6 py-3 rounded-lg border-2 border-primary">
  Ver Detalhes
  // Background: #424669 (Card)
  // Hover: #686F9C (Placeholder)
  // Borda: #F7B177 (Primary)
  // Texto: #FFFFFF (Foreground)
</button>

// Botão Subtle (Sem destaque)
<button className="bg-background hover:bg-card text-foreground px-6 py-3 rounded-lg border border-placeholder">
  Cancelar
  // Background: #2D3250 (Background)
  // Hover: #424669 (Card)
  // Borda: #686F9C (Placeholder)
</button>
```

### 📝 Inputs e Forms

```tsx
// Input padrão
<input
  className="w-full bg-background text-foreground px-4 py-3 rounded-lg
             border border-placeholder
             placeholder:text-placeholder
             focus:outline-none focus:ring-2 focus:ring-primary"
  placeholder="Digite aqui..."
/>
// Background: #2D3250 (Background - mais escuro que o card)
// Texto: #FFFFFF (Foreground)
// Borda: #686F9C (Placeholder)
// Placeholder: #686F9C (Placeholder)
// Focus ring: #F7B177 (Primary)

// Label
<label className="block text-foreground text-sm mb-2 font-medium">
  Nome do Campo *
  // Texto: #FFFFFF (Foreground)
</label>

// Textarea
<textarea
  className="w-full bg-background text-foreground px-4 py-3 rounded-lg
             border border-placeholder
             placeholder:text-placeholder
             focus:outline-none focus:ring-2 focus:ring-primary"
  rows={4}
/>

// Select
<select className="w-full bg-background text-foreground px-4 py-3 rounded-lg
                   border border-placeholder
                   focus:outline-none focus:ring-2 focus:ring-primary">
  <option>Opção 1</option>
</select>
```

### 📊 Cards de Estatísticas

```tsx
// Card de métrica
<div className="bg-card rounded-lg p-6">
  <p className="text-placeholder text-sm">Total de Usuários</p>
  <p className="text-4xl font-bold text-foreground mt-2">150</p>
  // Background: #424669 (Card)
  // Label: #686F9C (Placeholder)
  // Valor: #FFFFFF (Foreground)
</div>

// Card com destaque
<div className="bg-card rounded-lg p-6 border-2 border-primary">
  <p className="text-placeholder text-sm">Destaque</p>
  <p className="text-3xl font-bold text-primary mt-2">R$ 10.000</p>
  // Background: #424669 (Card)
  // Borda: #F7B177 (Primary)
  // Valor: #F7B177 (Primary)
</div>
```

### 🏷️ Badges e Tags

```tsx
// Badge de status
<span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary/20 text-primary">
  Publicado
  // Background: #F7B177 com 20% opacidade
  // Texto: #F7B177 (Primary)
</span>

// Badge secundário
<span className="px-3 py-1 rounded-full text-sm font-semibold bg-placeholder/20 text-placeholder">
  Rascunho
  // Background: #686F9C com 20% opacidade
  // Texto: #686F9C (Placeholder)
</span>
```

### 📋 Tabelas

```tsx
// Table header
<thead className="bg-card border-b border-placeholder">
  <th className="text-placeholder text-xs uppercase">Nome</th>
  // Background: #424669 (Card)
  // Borda: #686F9C (Placeholder)
  // Texto: #686F9C (Placeholder)
</thead>

// Table row
<tr className="hover:bg-card/50 border-b border-placeholder/30">
  <td className="text-foreground">Conteúdo</td>
  // Hover: #424669 com 50% opacidade
  // Borda: #686F9C com 30% opacidade
  // Texto: #FFFFFF (Foreground)
</tr>
```

### 🔗 Links

```tsx
// Link primário
<Link className="text-primary hover:text-primary-600 font-medium">
  Ver mais
  // Texto: #F7B177 (Primary)
  // Hover: #F38431 (Primary-600)
</Link>

// Link subtle
<Link className="text-foreground hover:text-primary transition-colors">
  Voltar
  // Texto: #FFFFFF (Foreground)
  // Hover: #F7B177 (Primary)
</Link>
```

### 🎯 Estados de Feedback

```tsx
// Sucesso
<div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
  <p className="text-green-500">Operação realizada!</p>
</div>

// Erro
<div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
  <p className="text-red-500">Erro ao processar</p>
</div>

// Aviso
<div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
  <p className="text-yellow-500">Atenção necessária</p>
</div>

// Info
<div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
  <p className="text-blue-500">Informação importante</p>
</div>
```

### 🎴 Cards de Eventos (Netflix-style)

```tsx
// Card hover effect
<div className="bg-card rounded-lg overflow-hidden hover:ring-2 hover:ring-primary hover:scale-105 transition-all">
  <img src={banner} className="w-full h-48 object-cover" />
  <div className="p-4">
    <h3 className="text-foreground font-semibold text-lg">{title}</h3>
    <p className="text-placeholder text-sm mb-3">{subtitle}</p>
    <button className="w-full bg-primary hover:bg-primary-600 text-background py-2 rounded-lg">
      Ver Detalhes
    </button>
  </div>
  // Card: #424669 (Card)
  // Ring (hover): #F7B177 (Primary)
  // Título: #FFFFFF (Foreground)
  // Subtítulo: #686F9C (Placeholder)
  // Botão: #F7B177 (Primary)
</div>
```

### 📱 Modal/Dialog

```tsx
// Modal overlay
<div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
  // Modal content
  <div className="bg-card rounded-lg p-6 border border-placeholder">
    <h2 className="text-foreground font-bold text-xl mb-4">Título</h2>
    <p className="text-placeholder mb-6">Conteúdo do modal</p>

    <div className="flex gap-3">
      <button className="flex-1 bg-primary hover:bg-primary-600 text-background px-4 py-2 rounded-lg">
        Confirmar
      </button>
      <button className="flex-1 bg-background hover:bg-placeholder text-foreground px-4 py-2 rounded-lg border border-placeholder">
        Cancelar
      </button>
    </div>
  </div>
  // Overlay: #2D3250 com 80% opacidade
  // Modal: #424669 (Card)
  // Borda: #686F9C (Placeholder)
</div>
```

### 🎨 Checkbox e Radio

```tsx
// Checkbox
<input
  type="checkbox"
  className="w-5 h-5 rounded bg-background border-placeholder text-primary focus:ring-primary"
/>
// Background: #2D3250 (Background)
// Borda: #686F9C (Placeholder)
// Checked: #F7B177 (Primary)
// Focus: #F7B177 (Primary)
```

### 📂 Accordion/Dropdown

```tsx
// Accordion item
<div className="border border-placeholder rounded-lg overflow-hidden">
  <button className="w-full bg-card hover:bg-placeholder text-foreground p-4 text-left font-medium flex justify-between items-center">
    <span>Item</span>
    <ChevronIcon className="text-primary" />
  </button>
  <div className="bg-background p-4 border-t border-placeholder">
    <p className="text-placeholder">Conteúdo</p>
  </div>
  // Header: #424669 (Card)
  // Conteúdo: #2D3250 (Background)
  // Borda: #686F9C (Placeholder)
  // Ícone: #F7B177 (Primary)
</div>
```

### 🎯 Progress Bar

```tsx
// Progress bar
<div className="w-full bg-background rounded-full h-2 border border-placeholder">
  <div className="bg-primary h-full rounded-full" style={{ width: '70%' }}></div>
  // Background: #2D3250 (Background)
  // Borda: #686F9C (Placeholder)
  // Fill: #F7B177 (Primary)
</div>
```

---

## 🎨 Hierarquia Visual

### Níveis de Contraste

1. **Mais Escuro** → `bg-background` (#2D3250)
   - Fundo principal
   - Inputs e formulários
   - Separadores

2. **Médio** → `bg-card` (#424669)
   - Cards e containers
   - Navbar
   - Table headers
   - Botões secundários

3. **Sutil** → `bg-placeholder` (#686F9C)
   - Hover states
   - Borders
   - Textos secundários

4. **Destaque** → `bg-primary` (#F7B177)
   - Botões principais
   - Links ativos
   - Elementos interativos
   - Badges importantes

5. **Texto** → `text-foreground` (#FFFFFF)
   - Textos principais
   - Títulos
   - Labels importantes

---

## ✅ Checklist de Cores

Ao criar um novo componente, verifique:

- [ ] Fundo usa `bg-background` ou `bg-card`
- [ ] Textos principais usam `text-foreground`
- [ ] Textos secundários usam `text-placeholder`
- [ ] Botões primários usam `bg-primary`
- [ ] Borders usam `border-placeholder`
- [ ] Hovers usam variações do primary (`hover:bg-primary-600`)
- [ ] Focus rings usam `focus:ring-primary`
- [ ] Inputs têm `bg-background` com `border-placeholder`

---

## 🎯 Exemplos Práticos

### Formulário Completo

```tsx
<form className="bg-card rounded-lg p-6 space-y-6">
  <h2 className="text-foreground text-2xl font-bold mb-4">Cadastro</h2>

  <div>
    <label className="block text-foreground text-sm mb-2 font-medium">
      Nome completo *
    </label>
    <input
      type="text"
      className="w-full bg-background text-foreground px-4 py-3 rounded-lg
                 border border-placeholder placeholder:text-placeholder
                 focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="Digite seu nome"
    />
  </div>

  <div>
    <label className="block text-foreground text-sm mb-2 font-medium">
      E-mail *
    </label>
    <input
      type="email"
      className="w-full bg-background text-foreground px-4 py-3 rounded-lg
                 border border-placeholder placeholder:text-placeholder
                 focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="seu@email.com"
    />
  </div>

  <div className="flex gap-3">
    <button
      type="submit"
      className="flex-1 bg-primary hover:bg-primary-600 text-background
                 px-6 py-3 rounded-lg font-semibold transition-colors"
    >
      Cadastrar
    </button>
    <button
      type="button"
      className="px-6 py-3 bg-background hover:bg-card text-foreground
                 rounded-lg font-semibold border border-placeholder transition-colors"
    >
      Cancelar
    </button>
  </div>
</form>
```

---

**Última atualização:** Dezembro 2024
**Versão:** 2.0 (Nova Paleta)
