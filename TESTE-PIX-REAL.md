# 💰 Teste de PIX Real - R$ 1,00

## Pré-requisitos

### 1. Criar conta REAL no Asaas

1. Acesse: https://www.asaas.com/
2. Clique em "Criar conta grátis"
3. Complete o cadastro
4. **Importante:** Esta é uma conta de PRODUÇÃO, não sandbox

### 2. Gerar API Key de Produção

1. Acesse: https://www.asaas.com/config/api
2. Clique em "Gerar nova chave"
3. Copie a chave completa
4. **ATENÇÃO:** Esta chave processa pagamentos REAIS

### 3. Configurar .env.local

Abra o arquivo `.env.local` e configure:

```env
# Asaas Payment Gateway - PRODUÇÃO
ASAAS_API_KEY=SUA_CHAVE_DE_PRODUCAO_AQUI
ASAAS_ENVIRONMENT=production
ASAAS_WEBHOOK_TOKEN=meu-token-secreto-123
```

**IMPORTANTE:**
- Se a chave começar com `$`, remova o `$`
- Não use aspas
- Salve o arquivo

### 4. Reiniciar Servidor

```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

## Como Testar

### 1. Acessar Página de Teste

Abra no navegador:
```
http://localhost:3000/teste-pagamento-real
```

### 2. Preencher Formulário

- **Nome:** Seu nome completo
- **Email:** Seu email
- **CPF:** Seu CPF (será usado para identificar o pagamento)
- **Telefone:** (Opcional) Seu WhatsApp
- **Valor:** R$ 1,00 (fixo)

### 3. Gerar PIX

1. Clique em "💰 Gerar PIX de R$ 1,00"
2. Um QR Code será exibido
3. **Este é um PIX REAL!**

### 4. Pagar

**Opção 1 - Escanear QR Code:**
1. Abra o app do seu banco
2. Vá em PIX → Ler QR Code
3. Escaneie o QR Code exibido
4. Confirme o pagamento de R$ 1,00

**Opção 2 - Pix Copia e Cola:**
1. Clique em "📋 Copiar Código PIX"
2. Abra o app do seu banco
3. Vá em PIX → Colar Código
4. Cole o código
5. Confirme o pagamento de R$ 1,00

### 5. Confirmar Pagamento

Após pagar:
1. Aguarde alguns segundos
2. Acesse o painel do Asaas: https://www.asaas.com/cobrancas
3. Veja a cobrança com status "RECEBIDO" ou "CONFIRMADO"

## Webhook (Opcional para testes locais)

Se quiser testar o webhook localmente:

### 1. Iniciar ngrok

```bash
ngrok http 3000
```

### 2. Configurar Webhook no Asaas

1. Acesse: https://www.asaas.com/config/webhook
2. Adicione webhook:
   - **Nome:** StageOne Local
   - **URL:** `https://SUA-URL.ngrok-free.dev/api/payments/asaas/webhook`
   - **Eventos:**
     - ✅ PAYMENT_RECEIVED
     - ✅ PAYMENT_CONFIRMED
   - **Status:** Ativo

### 3. Após Pagar

O webhook será disparado automaticamente e você verá logs no terminal.

## Verificar Resultados

### No Asaas

1. Acesse: https://www.asaas.com/cobrancas
2. Veja a cobrança criada
3. Status deve estar "RECEBIDO" após pagamento

### No Terminal

Veja os logs do Next.js para ver o webhook sendo processado.

## Custos

- **Asaas cobra taxa de R$ 0,99 por PIX recebido** (valores podem variar)
- O teste custará aproximadamente R$ 1,00 + R$ 0,99 = R$ 1,99
- Você receberá R$ 0,01 na sua conta Asaas (R$ 1,00 - R$ 0,99)

## Importante

- Este é um pagamento REAL
- O dinheiro será debitado da sua conta
- Use apenas para testes de integração
- O webhook funciona automaticamente em produção (URL pública)
- Para localhost, use ngrok

## Próximos Passos

Após validar que funciona:

1. ✅ Integrar com sistema de ingressos real
2. ✅ Configurar webhook em produção no Vercel
3. ✅ Adicionar envio de email após confirmação
4. ✅ Implementar dashboard de pagamentos

## Troubleshooting

### Erro: "API Key inválida"
- Verifique se copiou a chave correta de PRODUÇÃO
- Remova o `$` do início se houver
- Reinicie o servidor Next.js

### PIX não foi gerado
- Verifique os logs do terminal
- Confirme que ASAAS_ENVIRONMENT=production
- Teste a conexão: `node test-asaas-connection.js`

### Webhook não funciona
- Verifique se o ngrok está rodando
- Confirme a URL no painel do Asaas
- Verifique logs do terminal
