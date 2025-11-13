# Countdown App 🎯⏰

App de contagem regressiva multiplataforma (iOS, Android, Web) construído com React Native e Expo.

## 🔒 Autenticação Obrigatória

**IMPORTANTE:** Este app requer autenticação obrigatória via Supabase.

- 🔐 **Login obrigatório** - A primeira tela é login/registro
- 🔐 **Não há modo offline/local** - É necessário ter conta
- ☁️ **Sincronização automática** - Todos eventos na nuvem
- 🔒 **Privacidade garantida** - Cada usuário vê apenas seus eventos
- 💾 **Sessão persistente** - Login uma vez, use sempre

---

## ✨ Features Completas

### 📋 Gerenciamento de Eventos
- ✅ **CRUD Completo**: Criar, editar e excluir eventos
- ✅ **Contagem Regressiva em Tempo Real**: Atualização a cada segundo
- ✅ **Formato Brasileiro**: Data dd/mm/yyyy
- ✅ **Auto-ordenação**: Eventos mais próximos primeiro
- ✅ **Long Press**: Pressione e segure um evento para ver ações

### 💾 Persistência & Autenticação
- ✅ **Autenticação Obrigatória**: Login via Supabase
- ✅ **Supabase Cloud Sync**: Sincronização automática na nuvem
- ✅ **Real-time Updates**: Atualizações instantâneas entre dispositivos
- ✅ **AsyncStorage**: Cache local para melhor performance
- ✅ **Sessão Persistente**: Login mantido automaticamente

### 🎨 Interface
- ✅ **Modo Escuro/Claro**: Alternância com animação
- ✅ **Categorias Visuais**: 5 categorias com ícones e cores
- ✅ **Design Moderno**: Gradientes e sombras suaves
- ✅ **Responsivo**: Adapta-se a qualquer tela
- ✅ **Animações**: FAB animado, transições suaves

### 🔔 Notificações
- ✅ **Push Notifications**: Alertas antes do evento
- ✅ **Configurável**: Escolha quando ser notificado
- ✅ **Auto-agendamento**: Notificações criadas automaticamente

### 📤 Compartilhamento
- ✅ **Compartilhar Eventos**: Via WhatsApp, SMS, etc
- ✅ **Web Share API**: Suporte nativo no navegador
- ✅ **Cópia para Clipboard**: Fallback automático

### 🔁 Eventos Recorrentes
- ✅ **Repetição Anual**: Para aniversários, feriados
- ✅ **Auto-recriação**: Novos eventos criados automaticamente
- ✅ **Notificações Persistentes**: Recriadas para cada ocorrência

### 🔐 Segurança
- ✅ **Row Level Security**: Dados isolados por usuário no Supabase
- ✅ **Variáveis de Ambiente**: Credenciais protegidas

## Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- **Conta Supabase** (obrigatório) - [Criar conta grátis](https://supabase.com)

### Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar Supabase (OBRIGATÓRIO)
# Siga as instruções em SUPABASE_SETUP.md
# Crie o arquivo .env com suas credenciais

# 3. Iniciar o projeto
npm start
```

> ⚠️ **IMPORTANTE:** O app não funcionará sem o Supabase configurado, pois a autenticação é obrigatória.

### Executar em Plataformas Específicas

```bash
# Web
npm run web

# iOS (requer Mac)
npm run ios

# Android (requer Android Studio)
npm run android
```

## Estrutura do Projeto

```
/countdown
├── App.tsx              # Entry point
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── contexts/        # Context API (Estado global)
│   ├── hooks/           # Custom hooks
│   ├── screens/         # Telas do app
│   ├── services/        # Serviços (API, Storage)
│   ├── types/           # TypeScript types
│   └── utils/           # Funções utilitárias
```

## Tecnologias

- **React Native + Expo** - Framework multiplataforma
- **TypeScript** - Type safety
- **Supabase** - Backend as a Service (autenticação + banco de dados)
- **AsyncStorage** - Cache local para performance
- **Context API** - Gerenciamento de estado
- **Linear Gradient** - Gradientes visuais
- **Expo Notifications** - Notificações push

## ⚠️ Configuração OBRIGATÓRIA do Supabase

**O app requer Supabase configurado para funcionar** (autenticação obrigatória).

**Setup completo:**

1. Siga as instruções em [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. Execute o SQL do schema no Supabase SQL Editor
3. Execute o SQL de `supabase/fix-rls-policies.sql` para corrigir as políticas RLS
4. Configure as variáveis de ambiente no arquivo `.env`
3. Reinicie o servidor

Com Supabase você ganha:
- 🌐 Backup automático na nuvem
- 📱 Multi-dispositivo (acesse de qualquer lugar)
- 🔄 Sincronização em tempo real
- 🔐 Segurança e autenticação

