# 🔔 Push Notifications - StageOne

Sistema completo de notificações push usando Firebase Cloud Messaging (FCM) para alertar usuários quando comprarem ingressos.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração do Firebase](#configuração-do-firebase)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Arquitetura](#arquitetura)
5. [Como Funciona](#como-funciona)
6. [Testando](#testando)

---

## 🎯 Visão Geral

O sistema de push notifications permite que usuários recebam alertas instantâneos no navegador (desktop e mobile) quando:
- ✅ Um ingresso for comprado/confirmado
- 📧 Combinado com email de confirmação
- 🔔 Funciona mesmo com navegador em background

**Recursos:**
- Notificações em tempo real via FCM
- Suporte a navegadores modernos (Chrome, Firefox, Edge, Safari 16+)
- Fallback gracioso quando navegador não suporta
- Prompt elegante para solicitar permissão
- Armazenamento de tokens no Supabase
- Click na notificação leva para página de ingressos

---

## 🔥 Configuração do Firebase

### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome do projeto: **StageOne** (ou outro nome)
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Configurar Cloud Messaging

1. No menu lateral, vá em **Build** → **Cloud Messaging**
2. Clique em "Começar"
3. Aceite os termos

### 3. Obter Credenciais Web

#### API Key e Config

1. Vá em **Configurações do projeto** (ícone de engrenagem)
2. Em "Seus apps", clique no ícone **Web** (`</>`)
3. Registre seu app:
   - Apelido: `StageOne Web`
   - Não marque Firebase Hosting (ainda)
4. Copie as credenciais exibidas:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "stageone-xxx.firebaseapp.com",
  projectId: "stageone-xxx",
  storageBucket: "stageone-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

#### VAPID Key (Web Push Certificate)

1. Ainda em **Configurações do projeto**
2. Vá na aba **Cloud Messaging**
3. Role até "Configuração da Web"
4. Em "Certificados de push da Web", clique em **Gerar par de chaves**
5. Copie a **Chave pública** (VAPID Key)

#### Server Key

1. Na mesma página (Cloud Messaging)
2. Em "APIs Cloud Messaging (herdado)", copie a **Chave do servidor**
3. ⚠️ **IMPORTANTE**: Esta chave é **SECRETA**, use apenas no servidor!

---

## 🔐 Variáveis de Ambiente

Crie/atualize seu arquivo `.env.local`:

```bash
# Firebase Client (Público - usado no navegador)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stageone-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=stageone-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=stageone-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BNdG5y... # Chave pública VAPID

# Firebase Server (Secreto - usado apenas no backend)
FIREBASE_SERVER_KEY=AAAA... # Server Key do Cloud Messaging
```

### ⚠️ Atualizar Service Worker

Edite o arquivo `public/firebase-messaging-sw.js` e substitua os valores de configuração:

```javascript
firebase.initializeApp({
  apiKey: 'SUA_API_KEY_AQUI',
  authDomain: 'SEU_AUTH_DOMAIN_AQUI',
  projectId: 'SEU_PROJECT_ID_AQUI',
  storageBucket: 'SEU_STORAGE_BUCKET_AQUI',
  messagingSenderId: 'SEU_MESSAGING_SENDER_ID_AQUI',
  appId: 'SEU_APP_ID_AQUI',
})
```

---

## 🏗️ Arquitetura

### Arquivos Criados

```
StageOne/
├── lib/
│   ├── firebase/
│   │   └── config.ts                 # Configuração Firebase + FCM
│   └── notifications/
│       └── send-ticket-notification.ts # Helper para enviar notificação
├── hooks/
│   └── usePushNotifications.ts        # Hook React para gerenciar tokens
├── components/
│   └── PushNotificationPrompt.tsx     # Prompt para solicitar permissão
├── app/
│   ├── api/
│   │   ├── notifications/
│   │   │   └── send/
│   │   │       └── route.ts           # API para enviar notificações
│   │   └── tickets/
│   │       └── create/
│   │           └── route.ts           # Integrado com notificação push
│   └── layout.tsx                      # Adicionado PushNotificationPrompt
└── public/
    └── firebase-messaging-sw.js        # Service Worker para notificações background
```

### Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    1. Solicitação de Permissão             │
│                                                              │
│  Usuário acessa o site → Após 3s aparece prompt            │
│  → Clica em "Ativar" → Browser solicita permissão          │
│  → FCM Token gerado → Salvo em users.fcm_token (Supabase)  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    2. Compra de Ingresso                    │
│                                                              │
│  Usuário finaliza compra → API /tickets/create             │
│  → Ticket criado no DB → Email enviado                     │
│  → Busca FCM token do user → Envia push via FCM API        │
│  → Notificação aparece no dispositivo                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    3. Recebimento                           │
│                                                              │
│  App em foreground → onMessage() captura → Mostra notif.   │
│  App em background → Service Worker captura → Mostra notif.│
│  Usuário clica → Abre /meus-ingressos                      │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Como Funciona

### 1. Solicitação de Permissão

O componente `PushNotificationPrompt` aparece automaticamente após 3 segundos da primeira visita:

```tsx
// Exibido apenas se:
// - Usuário nunca viu o prompt antes
// - Permissão ainda está em 'default'
// - Browser suporta notificações
```

### 2. Gerenciamento de Token

O hook `usePushNotifications` cuida de:

- ✅ Verificar suporte do navegador
- ✅ Solicitar permissão
- ✅ Obter FCM token
- ✅ Salvar token no Supabase (`users.fcm_token`)
- ✅ Escutar mensagens em foreground

### 3. Envio de Notificação

Quando um ingresso é comprado em `/api/tickets/create`:

```typescript
// 1. Ticket criado com sucesso
// 2. Email de confirmação enviado
// 3. Busca FCM token do usuário
// 4. Envia push notification via FCM API
// 5. Usuário recebe notificação instantânea
```

### 4. Service Worker (Background)

O arquivo `firebase-messaging-sw.js` cuida de:

- 📬 Receber notificações quando app está em background
- 🔔 Mostrar notificação no sistema operacional
- 🖱️ Capturar clique e navegar para `/meus-ingressos`

---

## 🧪 Testando

### Teste Local (Development)

1. **Inicie o servidor de desenvolvimento:**

```bash
npm run dev
```

2. **Abra o navegador:**
   - Chrome/Edge: `http://localhost:3000`
   - ⚠️ **HTTPS é obrigatório em produção!**

3. **Permita notificações:**
   - Aguarde o prompt aparecer (3s)
   - Clique em "Ativar"
   - Aceite a permissão do navegador

4. **Faça uma compra de teste:**
   - Navegue para um evento
   - Clique em "Comprar Ingresso"
   - Preencha os dados
   - Confirme a compra

5. **Verifique a notificação:**
   - ✅ Deve aparecer uma notificação: "🎉 Ingresso Confirmado!"
   - ✅ Clique nela para ir para "Meus Ingressos"

### Teste em Produção

1. **Deploy no Vercel:**

```bash
git add .
git commit -m "Implementar push notifications"
git push
```

2. **Configure as variáveis de ambiente:**
   - Acesse seu projeto no Vercel
   - Vá em Settings → Environment Variables
   - Adicione todas as variáveis do `.env.local`

3. **Teste em dispositivo móvel:**
   - Abra o site em um navegador mobile (Chrome/Safari)
   - Adicione à tela inicial (PWA)
   - Teste o fluxo completo

---

## 📊 Estrutura do Banco de Dados

Adicione a coluna `fcm_token` na tabela `users`:

```sql
ALTER TABLE public.users
ADD COLUMN fcm_token TEXT;
```

---

## 🎨 Personalização

### Mudar Texto da Notificação

Edite `/app/api/tickets/create/route.ts`:

```typescript
notification: {
  title: '🎉 Seu Título Aqui!',
  body: `Sua mensagem personalizada aqui!`,
  // ...
}
```

### Mudar Ícone da Notificação

Substitua os arquivos:
- `/public/icon-192x192.png`
- `/public/icon-512x512.png`

### Customizar Prompt

Edite `/components/PushNotificationPrompt.tsx` para mudar:
- Texto
- Cores
- Tempo de exibição
- Posicionamento

---

## ❗ Troubleshooting

### Notificação não aparece

1. ✅ Verifique se as variáveis de ambiente estão corretas
2. ✅ Confirme que `FIREBASE_SERVER_KEY` está configurada
3. ✅ Verifique se o usuário tem `fcm_token` no banco
4. ✅ Abra DevTools → Console para ver erros

### Permissão negada

- Se o usuário bloquear, ele precisa desbloquear manualmente:
  - Chrome: Ícone de cadeado → Configurações do site → Notificações → Permitir

### Service Worker não registra

- Limpe cache do navegador
- Force reload: `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)

---

## 🚀 Próximos Passos

- [ ] Adicionar notificações para eventos próximos
- [ ] Notificar quando check-in é realizado
- [ ] Permitir usuário configurar preferências de notificação
- [ ] Implementar notificações segmentadas por categoria
- [ ] Analytics de taxa de abertura de notificações

---

## 📚 Referências

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

**Desenvolvido para StageOne™**
Sistema de notificações push implementado com Firebase Cloud Messaging.
