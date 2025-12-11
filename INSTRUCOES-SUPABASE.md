# 🚀 Configuração do Supabase - Passo a Passo

## ⚠️ IMPORTANTE
Execute os scripts **exatamente nesta ordem**.

---

## 📋 Passo 1: Adicionar coluna cover_image

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **StageOne**
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie e cole o conteúdo abaixo:

```sql
-- Adicionar coluna cover_image
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Copiar dados existentes
UPDATE public.events
SET cover_image = banner_url
WHERE cover_image IS NULL AND banner_url IS NOT NULL;
```

6. Clique no botão **RUN** (canto inferior direito)
7. ✅ Deve aparecer "Success. No rows returned"

---

## 📋 Passo 2: Criar bucket de storage

1. Ainda no **SQL Editor**
2. Clique em **New Query** novamente
3. Copie e cole o conteúdo abaixo:

```sql
-- Criar bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;
```

4. Clique em **RUN**
5. ✅ Deve aparecer "Success. No rows returned"

---

## 📋 Passo 3: Configurar políticas de acesso

### 3.1 - Política de Leitura Pública

1. **New Query**
2. Cole:

```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');
```

3. **RUN**

---

### 3.2 - Política de Upload

1. **New Query**
2. Cole:

```sql
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');
```

3. **RUN**

---

### 3.3 - Política de Update

1. **New Query**
2. Cole:

```sql
CREATE POLICY "Authenticated update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images');
```

3. **RUN**

---

### 3.4 - Política de Delete

1. **New Query**
2. Cole:

```sql
CREATE POLICY "Authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');
```

3. **RUN**

---

## ✅ Verificar se funcionou

### Verificar Bucket:
1. No menu lateral, vá em **Storage**
2. Você deve ver o bucket **event-images**
3. Clique nele - deve estar vazio por enquanto

### Verificar Coluna:
1. Vá em **Database** → **Tables**
2. Clique em **events**
3. Vá na aba **Columns**
4. Procure pela coluna **cover_image** - ela deve existir

---

## 🧪 Testar no seu app

1. **Volte para o navegador** onde está o localhost:3002
2. **Recarregue a página** (F5 ou Cmd+R)
3. Tente:
   - ✅ Editar um evento (deve abrir sem erro)
   - ✅ Fazer upload de uma imagem
   - ✅ Deletar um evento

---

## ❌ Se der erro "Policy already exists"

Isso significa que a política já foi criada! Pule para a próxima.

---

## ❌ Se der erro "Bucket already exists"

Isso é bom! Significa que o bucket já existe. Continue com as políticas.

---

## 🆘 Ainda com problemas?

Me envie uma screenshot do erro que aparece no Supabase!
