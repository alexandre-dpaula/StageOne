# Configuração do Supabase - StageOne

Execute estes passos para corrigir todos os problemas de banco de dados e storage.

## Passo 1: Corrigir Schema do Banco de Dados

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione o projeto **StageOne**
3. Vá em **SQL Editor** (no menu lateral esquerdo)
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `fix-events-schema.sql`
6. Clique em **RUN** para executar

**O que este script faz:**
- Adiciona a coluna `cover_image` na tabela `events`
- Copia dados de `banner_url` para `cover_image` (se houver)
- Renomeia a tabela `ticket_types` para `tickets_types` (se necessário)

---

## Passo 2: Criar Bucket de Storage para Imagens

1. Ainda no **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `create-storage-bucket.sql`
4. Clique em **RUN** para executar

**O que este script faz:**
- Cria o bucket `event-images` com limite de 1MB por arquivo
- Configura acesso público para leitura
- Permite upload/atualização/deleção apenas para usuários autenticados
- Aceita apenas arquivos de imagem (JPEG, PNG, WebP, GIF)

---

## Passo 3: Verificar Configuração

### Verificar Bucket:
1. Vá em **Storage** no menu lateral
2. Você deve ver o bucket `event-images` listado
3. Clique nele para confirmar que está configurado como **Público**

### Verificar Tabelas:
1. Vá em **Database** → **Tables** no menu lateral
2. Verifique se existe a tabela `tickets_types` (com 's' no final)
3. Clique na tabela `events` e verifique se a coluna `cover_image` existe

---

## Passo 4: Testar Funcionalidades

Depois de executar os scripts SQL, teste:

1. ✅ **Editar Evento**: Clique em "Editar" em qualquer evento
2. ✅ **Deletar Evento**: Clique em "Excluir" em qualquer evento
3. ✅ **Upload de Imagem**: Tente fazer upload de uma imagem ao criar/editar evento

---

## Arquivos SQL de Referência

- `fix-events-schema.sql` - Corrige schema de eventos e tipos de ingresso
- `create-storage-bucket.sql` - Cria bucket para upload de imagens

---

## Troubleshooting

### Erro: "Bucket not found"
- Execute o script `create-storage-bucket.sql` novamente
- Verifique se o bucket aparece em Storage

### Erro: "Could not find table 'ticket_types'"
- Execute o script `fix-events-schema.sql` novamente
- Verifique se a tabela foi renomeada para `tickets_types`

### Erro: "Column 'cover_image' does not exist"
- Execute o script `fix-events-schema.sql` novamente
- Verifique na tabela `events` se a coluna foi criada
