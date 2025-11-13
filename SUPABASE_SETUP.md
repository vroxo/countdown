# Configuração do Supabase

## Passo 1: Criar projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha os dados do projeto e aguarde a criação

## Passo 2: Executar o Schema SQL

1. No dashboard do seu projeto, vá em **SQL Editor**
2. Clique em "New Query"
3. Copie todo o conteúdo do arquivo `supabase/schema.sql`
4. Cole no editor e clique em "Run"
5. Aguarde a confirmação de sucesso

## Passo 3: Obter as credenciais

1. No dashboard, vá em **Settings** > **API**
2. Copie os seguintes valores:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (uma chave longa começando com `eyJ...`)

## Passo 4: Configurar o app

Crie um arquivo `.env` na raiz do projeto com:

\`\`\`env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
\`\`\`

## Passo 5: Reiniciar o servidor

\`\`\`bash
# Pare o servidor (Ctrl+C) e reinicie:
npm start
\`\`\`

## Funcionalidades com Supabase

✅ **Sincronização em nuvem** - Eventos salvos no servidor  
✅ **Multi-dispositivo** - Acesse de qualquer lugar  
✅ **Real-time** - Atualizações automáticas  
✅ **Backup automático** - Seus dados estão seguros  

## Modo Offline

O app funciona perfeitamente **sem** Supabase configurado!  
Nesse caso, usa apenas AsyncStorage local.

---

**Nota:** Mantenha suas credenciais em segredo e nunca as compartilhe!

