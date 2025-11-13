# Contribuindo para o Countdown App 🎯

Obrigado pelo seu interesse em contribuir com o Countdown App! Este documento fornece diretrizes para ajudar você a contribuir de forma efetiva.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configuração do Ambiente de Desenvolvimento](#configuração-do-ambiente-de-desenvolvimento)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Diretrizes de Código](#diretrizes-de-código)
- [Testes](#testes)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)

## 📜 Código de Conduta

Este projeto e todos os participantes são regidos por um código de conduta. Ao participar, espera-se que você mantenha esse código. Por favor, reporte comportamentos inaceitáveis.

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## 🤝 Como Posso Contribuir?

Existem várias maneiras de contribuir para o Countdown App:

### 1. Reportar Bugs
Encontrou um bug? Abra uma issue com:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Screenshots (se aplicável)
- Informações do ambiente (OS, versão do app, etc.)

### 2. Sugerir Melhorias
Tem uma ideia? Compartilhe através de uma issue incluindo:
- Descrição detalhada da funcionalidade
- Por que seria útil
- Exemplos de uso

### 3. Contribuir com Código
- Correção de bugs
- Novas funcionalidades
- Melhorias de performance
- Melhorias de UI/UX
- Documentação

### 4. Melhorar Documentação
- Corrigir erros de digitação
- Adicionar exemplos
- Melhorar clareza
- Traduzir documentação

## 🛠️ Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- Conta no Supabase (para funcionalidades de autenticação e sincronização)
- Git

### Instalação

1. **Fork o repositório**
   ```bash
   # Clique no botão "Fork" no GitHub
   ```

2. **Clone seu fork**
   ```bash
   git clone https://github.com/seu-usuario/countdown.git
   cd countdown
   ```

3. **Instale as dependências**
   ```bash
   npm install
   ```

4. **Configure as variáveis de ambiente**
   
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

   Veja [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para instruções completas.

5. **Configure o banco de dados**
   ```bash
   # Execute o SQL em supabase/schema.sql no Supabase SQL Editor
   ```

6. **Inicie o projeto**
   ```bash
   npm start
   ```

## 🔄 Fluxo de Trabalho

### 1. Crie uma Branch

Sempre crie uma nova branch para suas mudanças:

```bash
git checkout -b tipo/descricao-curta
```

Tipos de branch:
- `feature/` - Nova funcionalidade
- `fix/` - Correção de bug
- `docs/` - Mudanças na documentação
- `refactor/` - Refatoração de código
- `test/` - Adição ou correção de testes
- `chore/` - Tarefas de manutenção

Exemplos:
```bash
git checkout -b feature/add-event-categories
git checkout -b fix/notification-timing
git checkout -b docs/update-readme
```

### 2. Faça Suas Mudanças

- Escreva código limpo e legível
- Siga as diretrizes de código (veja abaixo)
- Adicione testes quando aplicável
- Atualize a documentação se necessário

### 3. Commit Suas Mudanças

Use mensagens de commit claras e descritivas:

```bash
git commit -m "tipo: descrição curta

Descrição mais detalhada do que foi mudado e por quê.

Closes #123"
```

Tipos de commit (seguindo Conventional Commits):
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `style:` - Formatação, ponto e vírgula faltando, etc.
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Tarefas de manutenção

Exemplos:
```
feat: add recurring events support

Implements monthly and yearly recurring events with automatic
event recreation after completion.

Closes #45
```

```
fix: correct notification timing calculation

Fixed an issue where notifications were scheduled with incorrect
timezone offset causing them to trigger at wrong times.

Fixes #89
```

### 4. Push para seu Fork

```bash
git push origin sua-branch
```

### 5. Abra um Pull Request

- Vá para o repositório original no GitHub
- Clique em "New Pull Request"
- Selecione sua branch
- Preencha o template de PR (veja seção abaixo)

## 💻 Diretrizes de Código

### Padrões Gerais

1. **Código em Inglês**
   - Todos os comentários, nomes de variáveis, funções e classes devem estar em inglês
   - Apenas strings visíveis ao usuário devem estar em português

2. **TypeScript**
   - Use TypeScript para todo código novo
   - Adicione tipos adequados (evite `any`)
   - Use interfaces para definir estruturas de dados

3. **Estrutura de Arquivos**
   - Mantenha arquivos pequenos (< 300 linhas)
   - Um componente por arquivo
   - Agrupe arquivos relacionados em pastas

4. **Nomenclatura**
   - Componentes: `PascalCase` (ex: `EventCard.tsx`)
   - Hooks: `camelCase` com prefixo `use` (ex: `useEvents.ts`)
   - Serviços: `camelCase` com sufixo `.service.ts` (ex: `storage.service.ts`)
   - Utilitários: `camelCase` (ex: `dateUtils.ts`)
   - Constantes: `UPPER_SNAKE_CASE` (ex: `APP_CONFIG`)

### React/React Native

1. **Componentes Funcionais**
   - Use componentes funcionais com hooks
   - Evite componentes de classe

2. **Hooks**
   - Use hooks nativos adequadamente
   - Crie hooks customizados para lógica reutilizável
   - Siga as regras dos hooks (não chame condicionalmente)

3. **Props**
   - Sempre defina interfaces para props
   - Use destructuring para acessar props

   ```typescript
   interface EventCardProps {
     event: Event;
     onPress: (event: Event) => void;
   }

   export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
     // componente
   };
   ```

4. **Estado**
   - Use Context API para estado global
   - Use `useState` para estado local
   - Evite prop drilling excessivo

5. **Estilos**
   - Use `StyleSheet.create` para estilos
   - Mantenha estilos no mesmo arquivo do componente
   - Use constantes de tema para cores e espaçamentos

### Boas Práticas

1. **DRY (Don't Repeat Yourself)**
   - Evite duplicação de código
   - Crie funções e componentes reutilizáveis

2. **Single Responsibility**
   - Cada função/componente deve ter uma única responsabilidade
   - Divida funções grandes em funções menores

3. **Comentários**
   - Comente código complexo
   - Use JSDoc para documentar funções públicas
   - Mantenha comentários atualizados

4. **Error Handling**
   - Sempre trate erros adequadamente
   - Use try-catch em operações assíncronas
   - Forneça feedback ao usuário

5. **Performance**
   - Use `useMemo` e `useCallback` quando apropriado
   - Evite renderizações desnecessárias
   - Otimize listas com `FlatList` e `key` apropriada

## 🧪 Testes

### Executando Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

### Escrevendo Testes

1. **Estrutura de Testes**
   ```typescript
   describe('ComponentName', () => {
     it('should do something', () => {
       // Arrange
       // Act
       // Assert
     });
   });
   ```

2. **Cobertura**
   - Escreva testes para novas funcionalidades
   - Mantenha cobertura mínima de 80%
   - Teste casos de sucesso e falha

3. **Testing Library**
   - Use `@testing-library/react-native` para componentes
   - Use `jest` para lógica de negócio
   - Foque em testar comportamento, não implementação

## 📝 Processo de Pull Request

### Template de PR

Ao abrir um PR, inclua:

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passos para testar...
2. ...

## Checklist
- [ ] Meu código segue as diretrizes do projeto
- [ ] Revisei meu próprio código
- [ ] Comentei código complexo
- [ ] Atualizei a documentação
- [ ] Não introduzi novos warnings
- [ ] Adicionei testes que provam que minha correção/funcionalidade funciona
- [ ] Testes unitários passam localmente
- [ ] Mudanças dependentes foram mergeadas

## Screenshots (se aplicável)
```

### Revisão de Código

- Seja receptivo a feedback
- Responda a comentários de revisores
- Faça mudanças solicitadas prontamente
- Mantenha a discussão profissional e construtiva

### Requisitos para Merge

- ✅ Todos os testes passando
- ✅ Code review aprovado
- ✅ Sem conflitos com a branch principal
- ✅ Documentação atualizada
- ✅ Segue as diretrizes de código

## 🐛 Reportando Bugs

### Antes de Reportar

- Verifique se o bug já foi reportado
- Certifique-se de estar usando a versão mais recente
- Tente reproduzir com configuração mínima

### Template de Issue para Bugs

```markdown
## Descrição do Bug
Descrição clara do que está errado

## Para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

## Comportamento Esperado
O que deveria acontecer

## Comportamento Atual
O que acontece de fato

## Screenshots
Se aplicável

## Ambiente
- OS: [ex: iOS 14.5]
- Versão do App: [ex: 1.0.0]
- Dispositivo: [ex: iPhone 12]
```

## 💡 Sugerindo Melhorias

### Template de Issue para Features

```markdown
## Descrição da Feature
Descrição clara da funcionalidade proposta

## Problema que Resolve
Qual problema esta feature resolve?

## Solução Proposta
Como você imagina que funcione?

## Alternativas Consideradas
Outras abordagens que você pensou?

## Contexto Adicional
Screenshots, mockups, etc.
```

## 📚 Recursos Úteis

### Documentação
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [Supabase](https://supabase.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Ferramentas
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/)
- [VS Code React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native)

## ❓ Dúvidas?

Se você tiver dúvidas sobre como contribuir:

1. Verifique a documentação existente
2. Procure em issues fechadas
3. Abra uma issue com sua pergunta
4. Entre em contato com os mantenedores

## 🙏 Reconhecimento

Todas as contribuições são valorizadas e reconhecidas! Contribuidores serão listados no README.md.

Obrigado por contribuir para tornar o Countdown App melhor! 🎉

---

**Nota:** Este é um projeto em constante evolução. Estas diretrizes podem mudar ao longo do tempo. Sempre verifique a versão mais recente antes de contribuir.

