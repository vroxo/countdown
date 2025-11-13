# 📝 Documentação Completa de Features

## 🎯 Como Usar o App

### Criar um Evento

1. **Clique no botão + (FAB)** no canto inferior direito
2. **Preencha o formulário**:
   - Nome do evento
   - Data (formato: dd/mm/yyyy)
   - Horário (formato: HH:MM)
   - Selecione uma categoria
   - Ative "Evento Recorrente" se desejar
   - Ative "Notificações" para receber alertas
3. **Clique em "Criar"**

### Editar um Evento

1. **Pressione e segure** o card do evento
2. **Clique em "✏️ Editar"**
3. Faça as alterações necessárias
4. Clique em "Salvar"

### Compartilhar um Evento

1. **Pressione e segure** o card do evento
2. **Clique em "📤 Compartilhar"**
3. Escolha o app (WhatsApp, SMS, Email, etc)

### Excluir um Evento

1. **Pressione e segure** o card do evento
2. **Clique em "🗑️ Excluir"**
3. Confirme a exclusão

### Alternar Tema

- **Clique no toggle** no canto superior direito do header
- Escolha entre modo claro ☀️ e escuro 🌙
- A preferência é salva automaticamente

---

## 🔧 Recursos Técnicos

### Categorias Disponíveis

| Categoria | Emoji | Cor | Uso |
|-----------|-------|-----|-----|
| Pessoal | 👤 | Vermelho | Compromissos pessoais |
| Trabalho | 💼 | Azul | Reuniões, deadlines |
| Aniversários | 🎂 | Rosa | Aniversários |
| Viagens | ✈️ | Verde | Viagens e férias |
| Eventos | 🎉 | Laranja | Eventos especiais |

### Notificações

**Horários Padrão:**
- 1 hora antes do evento
- 1 dia antes do evento

**Como funcionam:**
- Agendadas automaticamente ao criar evento
- Re-agendadas ao editar evento
- Canceladas ao excluir evento
- Funcionam mesmo com app fechado (mobile)

### Eventos Recorrentes

**Tipos Suportados:**
- 🔁 Anual (para aniversários, feriados)
- 📅 Mensal (planos futuros)
- 📆 Semanal (planos futuros)

**Comportamento:**
- Quando um evento recorrente termina, um novo é criado automaticamente
- Notificações são re-agendadas para a nova ocorrência
- Sincronizado com Supabase se configurado

### Supabase Cloud

**Benefícios:**
- 🌐 Backup automático
- 📱 Multi-dispositivo
- 🔄 Sincronização em tempo real
- 🔐 Seguro e autenticado

**Status Indicators:**
- Badge "☁️ Cloud" - Conectado ao Supabase
- Badge "🔄 Sync..." - Sincronizando dados

---

## 🎨 Atalhos e Dicas

### Atalhos de Teclado (Web)
- `F5` ou `Ctrl+R` - Recarregar app
- `Ctrl+Shift+I` - Abrir DevTools

### Dicas de UX
- **Long Press** em eventos revela menu de ações
- **Pull to Refresh** atualiza a lista (mobile)
- **Swipe** para voltar em modais (mobile)
- **Scroll** infinito na lista de eventos

### Indicadores Visuais
- 🔥 **Badge "Em breve!"** - Eventos < 24 horas
- 🔄 **Ícone de recorrência** - Eventos que se repetem
- 🎉 **"Finalizado!"** - Eventos que já passaram
- ☁️ **Cloud badge** - Sync ativo com Supabase

---

## 📱 Plataformas Suportadas

### Web
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Desktop e Mobile
- ✅ Progressive Web App (PWA)

### iOS
- ✅ iPhone e iPad
- ✅ iOS 13+
- ⚠️ Requer Expo Go ou build standalone

### Android
- ✅ Todos os dispositivos
- ✅ Android 5.0+
- ⚠️ Requer Expo Go ou build standalone

---

## 🔒 Privacidade e Dados

### Armazenamento Local
- Todos os dados ficam no seu dispositivo
- Não são enviados a terceiros sem Supabase
- Podem ser limpos ao desinstalar o app

### Com Supabase
- Dados criptografados em trânsito (HTTPS)
- Row Level Security ativa
- Você controla seus dados
- Pode ser desativado a qualquer momento

---

## 🐛 Resolução de Problemas

### Eventos não aparecem após recarregar
- Verifique se permitiu armazenamento local
- Limpe o cache do navegador
- Verifique conexão com Supabase

### Notificações não funcionam
- Conceda permissões de notificação
- Verifique configurações do sistema
- Web: notificações funcionam com site aberto

### Supabase não conecta
- Verifique arquivo `.env`
- Execute o schema SQL no dashboard
- Confirme credenciais corretas

---

## 🎓 Tecnologias Utilizadas

- **React Native** - Framework
- **Expo** - Tooling
- **TypeScript** - Type Safety
- **Supabase** - Backend (opcional)
- **AsyncStorage** - Storage Local
- **Expo Notifications** - Push Notifications
- **Expo Sharing** - Share API
- **Linear Gradient** - Gradientes
- **Context API** - Estado Global

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte este documento
2. Verifique `SUPABASE_SETUP.md` para configuração
3. Leia os logs do console (DevTools)

---

**Desenvolvido com ❤️ usando React Native + Expo**

