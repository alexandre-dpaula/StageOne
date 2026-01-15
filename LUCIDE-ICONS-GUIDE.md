# 🎨 Lucide React Icons - Guia de Uso

Biblioteca de ícones moderna e otimizada para UI/UX profissional implementada no StageOne.

## 📦 Sobre o Lucide React

**Lucide** é uma biblioteca de ícones moderna, fork do Feather Icons com:
- ✅ Mais de 1000+ ícones
- ✅ Totalmente otimizada e tree-shakeable
- ✅ Design limpo e consistente
- ✅ Perfeito para interfaces modernas
- ✅ TypeScript nativo

**Instalado:** `lucide-react@0.560.0`

## 🎯 Como Usar

### Importação

```tsx
import { IconName } from 'lucide-react'
```

### Uso Básico

```tsx
<Wallet className="w-5 h-5 text-primary" />
```

### Props Disponíveis

```tsx
<Icon
  size={24}              // Tamanho (width e height)
  color="currentColor"   // Cor
  strokeWidth={2}        // Espessura do traço
  className="..."        // Classes CSS
  style={{ ... }}        // Estilos inline
/>
```

---

## 💼 Ícones Implementados no StageOne

### 💰 Financeiro / Carteira

```tsx
import { Wallet, CreditCard, TrendingUp, Target, DollarSign, Coins } from 'lucide-react'

// Exemplos
<Wallet className="w-5 h-5 text-primary" />        // Carteira
<CreditCard className="w-5 h-5" />                 // Cartão de crédito
<TrendingUp className="w-5 h-5 text-accent-green" /> // Crescimento
<Target className="w-5 h-5" />                      // Alvo/Meta
<DollarSign className="w-5 h-5" />                  // Cifrão
<Coins className="w-5 h-5" />                       // Moedas
```

### 🎫 Eventos & Tickets

```tsx
import { Ticket, Calendar, Clock, MapPin, Users, UserCheck } from 'lucide-react'

<Ticket className="w-5 h-5" />          // Ingresso
<Calendar className="w-5 h-5" />        // Calendário
<Clock className="w-5 h-5" />           // Relógio
<MapPin className="w-5 h-5" />          // Localização
<Users className="w-5 h-5" />           // Múltiplos usuários
<UserCheck className="w-5 h-5" />       // Usuário verificado
```

### 🎛️ Admin & Dashboard

```tsx
import { LayoutDashboard, Settings, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

<LayoutDashboard className="w-5 h-5" /> // Dashboard
<Settings className="w-5 h-5" />        // Configurações
<Plus className="w-5 h-5" />            // Adicionar
<Edit className="w-5 h-5" />            // Editar
<Trash2 className="w-5 h-5" />          // Deletar
<Eye className="w-5 h-5" />             // Visualizar
<EyeOff className="w-5 h-5" />          // Ocultar
```

### 🌐 Navegação & Interface

```tsx
import { Home, Globe, Menu, X, ChevronRight, ArrowLeft, Search } from 'lucide-react'

<Home className="w-5 h-5" />           // Início
<Globe className="w-5 h-5" />          // Global/Site
<Menu className="w-5 h-5" />           // Menu hamburguer
<X className="w-5 h-5" />              // Fechar
<ChevronRight className="w-5 h-5" />   // Seta direita
<ArrowLeft className="w-5 h-5" />      // Voltar
<Search className="w-5 h-5" />         // Buscar
```

### 📊 Estatísticas & Dados

```tsx
import { BarChart3, PieChart, TrendingDown, Activity, FileText } from 'lucide-react'

<BarChart3 className="w-5 h-5" />      // Gráfico de barras
<PieChart className="w-5 h-5" />       // Gráfico de pizza
<TrendingDown className="w-5 h-5" />   // Queda
<Activity className="w-5 h-5" />       // Atividade
<FileText className="w-5 h-5" />       // Documento
```

### 🔔 Notificações & Alertas

```tsx
import { Bell, BellOff, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

<Bell className="w-5 h-5" />           // Notificação
<BellOff className="w-5 h-5" />        // Notificação desativada
<AlertCircle className="w-5 h-5" />    // Alerta
<CheckCircle className="w-5 h-5" />    // Sucesso
<Info className="w-5 h-5" />           // Informação
<AlertTriangle className="w-5 h-5" />  // Aviso
```

### 👤 Usuário & Perfil

```tsx
import { User, UserCircle, LogIn, LogOut, UserPlus, Shield } from 'lucide-react'

<User className="w-5 h-5" />           // Usuário
<UserCircle className="w-5 h-5" />     // Perfil
<LogIn className="w-5 h-5" />          // Login
<LogOut className="w-5 h-5" />         // Logout
<UserPlus className="w-5 h-5" />       // Novo usuário
<Shield className="w-5 h-5" />         // Admin/Segurança
```

### 📧 Comunicação

```tsx
import { Mail, Send, MessageCircle, Phone, AtSign } from 'lucide-react'

<Mail className="w-5 h-5" />           // Email
<Send className="w-5 h-5" />           // Enviar
<MessageCircle className="w-5 h-5" />  // Mensagem
<Phone className="w-5 h-5" />          // Telefone
<AtSign className="w-5 h-5" />         // Menção/@
```

### 📁 Arquivos & Mídia

```tsx
import { File, FileText, Image, Upload, Download, Camera } from 'lucide-react'

<File className="w-5 h-5" />           // Arquivo
<FileText className="w-5 h-5" />       // Documento de texto
<Image className="w-5 h-5" />          // Imagem
<Upload className="w-5 h-5" />         // Upload
<Download className="w-5 h-5" />       // Download
<Camera className="w-5 h-5" />         // Câmera
```

### ⚙️ Sistema & Ações

```tsx
import { Save, Copy, Share2, Filter, SortAsc, RefreshCw, Power } from 'lucide-react'

<Save className="w-5 h-5" />           // Salvar
<Copy className="w-5 h-5" />           // Copiar
<Share2 className="w-5 h-5" />         // Compartilhar
<Filter className="w-5 h-5" />         // Filtrar
<SortAsc className="w-5 h-5" />        // Ordenar
<RefreshCw className="w-5 h-5" />      // Atualizar
<Power className="w-5 h-5" />          // Ligar/Desligar
```

---

## 🎨 Padrões de Design no StageOne

### Tamanhos Recomendados

```tsx
// Ícones em cards/botões grandes
<Icon className="w-5 h-5" />  // 20px

// Ícones em cards médios
<Icon className="w-4 h-4" />  // 16px

// Ícones inline com texto
<Icon className="w-3.5 h-3.5" /> // 14px

// Ícones em badges/tags
<Icon className="w-3 h-3" />  // 12px
```

### Cores do Design System

```tsx
// Verde primário
<Icon className="text-primary" />

// Verde accent
<Icon className="text-accent-green" />

// Texto principal (branco)
<Icon className="text-foreground" />

// Texto secundário (cinza)
<Icon className="text-placeholder" />

// Preto (para fundos verdes)
style={{ color: '#0A0B0D' }}
```

### Containers de Ícones

```tsx
// Container pequeno (32px)
<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
  <Icon className="w-4 h-4 text-primary" />
</div>

// Container médio (40px)
<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
  <Icon className="w-5 h-5 text-primary" />
</div>

// Container grande (48px)
<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
  <Icon className="w-6 h-6 text-primary" />
</div>
```

---

## 💡 Exemplos de Uso no StageOne

### Card Financeiro

```tsx
<div className="glass rounded-2xl p-6">
  <div className="flex items-center justify-between mb-3">
    <span className="text-placeholder text-sm">Receita Total</span>
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
      <Wallet className="w-4 h-4 text-primary" />
    </div>
  </div>
  <p className="text-3xl font-bold text-foreground">R$ 10.000,00</p>
</div>
```

### Botão com Ícone

```tsx
<button className="btn-primary flex items-center gap-2">
  <Plus className="w-4 h-4" />
  Criar Evento
</button>
```

### Lista com Ícones

```tsx
<div className="flex items-center gap-3">
  <Calendar className="w-4 h-4 text-placeholder" />
  <span>15 de Janeiro, 2025</span>
</div>

<div className="flex items-center gap-3">
  <MapPin className="w-4 h-4 text-placeholder" />
  <span>São Paulo - SP</span>
</div>
```

### Badge de Status

```tsx
<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-green/10">
  <CheckCircle className="w-3 h-3 text-accent-green" />
  <span className="text-xs text-accent-green font-bold">Confirmado</span>
</div>
```

---

## 🔍 Buscar Ícones

Explore todos os ícones disponíveis:

**🌐 Site Oficial:** https://lucide.dev/icons

**📦 NPM:** https://www.npmjs.com/package/lucide-react

---

## ⚡ Performance

Lucide React é **tree-shakeable**, ou seja:
- ✅ Apenas os ícones importados são incluídos no bundle
- ✅ Cada ícone adiciona ~1KB ao bundle
- ✅ Ícones são componentes React otimizados
- ✅ SVG inline para melhor performance

---

## 🚀 Migração de Emojis para Ícones

Se você encontrar emojis no código, considere substituir por ícones Lucide:

| Emoji | Ícone Lucide |
|-------|--------------|
| 💰 | `<Wallet />` |
| 📊 | `<BarChart3 />` |
| 🎯 | `<Target />` |
| 📈 | `<TrendingUp />` |
| 💳 | `<CreditCard />` |
| 👥 | `<Users />` |
| 🎫 | `<Ticket />` |
| 📅 | `<Calendar />` |
| 🔔 | `<Bell />` |
| ⚙️ | `<Settings />` |

---

**Desenvolvido para StageOne™**
Biblioteca de ícones Lucide React v0.560.0
