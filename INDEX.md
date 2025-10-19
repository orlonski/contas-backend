# Índice Completo do Projeto

## 📋 Sumário

Este documento lista todos os arquivos do projeto de forma organizada.

## 📁 Arquivos Raiz

### Configuração
- `.env` - Variáveis de ambiente (não committar)
- `.env.example` - Exemplo de variáveis de ambiente
- `.eslintrc.js` - Configuração do ESLint
- `.prettierrc` - Configuração do Prettier
- `.gitignore` - Arquivos ignorados pelo Git
- `.dockerignore` - Arquivos ignorados pelo Docker
- `nest-cli.json` - Configuração do NestJS CLI
- `tsconfig.json` - Configuração do TypeScript
- `package.json` - Dependências e scripts NPM

### Docker
- `Dockerfile` - Imagem Docker da aplicação
- `docker-compose.yml` - PostgreSQL + PgAdmin

### Documentação
- `README.md` - ⭐ Documentação principal
- `QUICKSTART.md` - ⭐ Guia de início rápido (leia primeiro!)
- `SUMMARY.md` - ⭐ Resumo executivo
- `ARCHITECTURE.md` - Arquitetura e decisões de design
- `API_EXAMPLES.md` - Exemplos práticos de uso
- `PROJECT_STRUCTURE.md` - Estrutura detalhada
- `INDEX.md` - Este arquivo

## 📂 prisma/

### Schema e Migrations
- `schema.prisma` - ⭐ Schema completo do banco de dados
- `seed.ts` - Script para popular banco com dados de exemplo

### Migrations
- `migrations/` - Pasta de migrations (criada após `prisma migrate`)

## 📂 src/

### 🔐 auth/ - Módulo de Autenticação
```
auth/
├── decorators/
│   └── current-user.decorator.ts    # Decorator @CurrentUser()
├── dto/
│   └── login.dto.ts                 # DTO de login
├── guards/
│   ├── jwt-auth.guard.ts            # Guard JWT
│   └── local-auth.guard.ts          # Guard local
├── strategies/
│   ├── jwt.strategy.ts              # Estratégia JWT Passport
│   └── local.strategy.ts            # Estratégia local Passport
├── auth.controller.ts               # POST /auth/register, /auth/login
├── auth.module.ts                   # Módulo de autenticação
└── auth.service.ts                  # Lógica de autenticação
```

### 👤 users/ - Módulo de Usuários
```
users/
├── dto/
│   ├── create-user.dto.ts           # DTO de criação
│   └── update-user.dto.ts           # DTO de atualização
├── users.controller.ts              # GET/PATCH/DELETE /users/me
├── users.module.ts                  # Módulo de usuários
└── users.service.ts                 # CRUD de usuários
```

### 🏦 accounts/ - Módulo de Contas
```
accounts/
├── dto/
│   ├── create-account.dto.ts        # DTO de criação
│   └── update-account.dto.ts        # DTO de atualização
├── accounts.controller.ts           # CRUD + /accounts/:id/balance
├── accounts.module.ts               # Módulo de contas
└── accounts.service.ts              # Lógica de contas + saldo
```

### 🏷️ categories/ - Módulo de Categorias
```
categories/
├── dto/
│   ├── create-category.dto.ts       # DTO de criação
│   └── update-category.dto.ts       # DTO de atualização
├── categories.controller.ts         # CRUD + /categories/tree
├── categories.module.ts             # Módulo de categorias
└── categories.service.ts            # Lógica de hierarquia
```

### 💸 transactions/ - Módulo de Transações
```
transactions/
├── dto/
│   ├── create-transaction.dto.ts    # DTO complexo (parcelamento/recorrência)
│   └── update-transaction.dto.ts    # DTO de atualização
├── transactions.controller.ts       # CRUD + /series/:id endpoints
├── transactions.module.ts           # Módulo de transações
└── transactions.service.ts          # ⭐ Lógica complexa de parcelamento
```

### 🧾 invoices/ - Módulo de Faturas
```
invoices/
├── invoices.controller.ts           # /invoices/card/:id, /pay, /close
├── invoices.module.ts               # Módulo de faturas
└── invoices.service.ts              # ⭐ Cálculo de faturas
```

### 📊 dashboard/ - Módulo de Dashboard
```
dashboard/
├── dashboard.controller.ts          # 5 endpoints de métricas
├── dashboard.module.ts              # Módulo de dashboard
└── dashboard.service.ts             # Agregações e cálculos
```

### 🔌 prisma/ - Módulo Prisma
```
prisma/
├── prisma.module.ts                 # Módulo global do Prisma
└── prisma.service.ts                # Serviço do Prisma Client
```

### 🚀 Arquivos Principais
- `main.ts` - ⭐ Entry point da aplicação
- `app.module.ts` - ⭐ Módulo raiz

## 📊 Estatísticas

### Arquivos por Tipo
- **TypeScript (.ts)**: 39 arquivos
- **Markdown (.md)**: 7 arquivos
- **JSON (.json)**: 3 arquivos
- **Configuração**: 6 arquivos
- **Docker**: 2 arquivos
- **Prisma**: 2 arquivos

### Total: 59 arquivos criados

### Por Módulo
- **auth/**: 9 arquivos
- **users/**: 5 arquivos
- **accounts/**: 5 arquivos
- **categories/**: 5 arquivos
- **transactions/**: 5 arquivos
- **invoices/**: 3 arquivos
- **dashboard/**: 3 arquivos
- **prisma/**: 2 arquivos
- **root**: 2 arquivos

## 🎯 Arquivos Mais Importantes

### Para Começar
1. `QUICKSTART.md` - Como rodar o projeto
2. `README.md` - Visão geral
3. `.env.example` - Configuração necessária
4. `docker-compose.yml` - Setup do banco

### Para Entender
1. `ARCHITECTURE.md` - Como funciona
2. `prisma/schema.prisma` - Estrutura do banco
3. `src/main.ts` - Entry point
4. `src/app.module.ts` - Módulos

### Para Desenvolver
1. `API_EXAMPLES.md` - Exemplos de uso
2. `PROJECT_STRUCTURE.md` - Estrutura
3. Swagger: http://localhost:3000/api

### Para Deploy
1. `Dockerfile` - Containerização
2. `docker-compose.yml` - Infraestrutura
3. `.env.example` - Variáveis necessárias

## 📝 Scripts NPM

### Desenvolvimento
```bash
npm run start:dev      # Hot reload
npm run start:debug    # Com debugger
```

### Build
```bash
npm run build         # Compilar
npm run start:prod    # Produção
```

### Prisma
```bash
npm run prisma:generate   # Gerar client
npm run prisma:migrate    # Migrations
npm run prisma:studio     # UI visual
npm run prisma:seed       # Popular banco
```

### Qualidade
```bash
npm run lint          # ESLint
npm run format        # Prettier
npm run test          # Testes
```

## 🗺️ Mapa de Navegação

### Quero rodar o projeto
➡️ Leia: `QUICKSTART.md`

### Quero entender a arquitetura
➡️ Leia: `ARCHITECTURE.md`

### Quero ver exemplos de API
➡️ Leia: `API_EXAMPLES.md`

### Quero entender o banco de dados
➡️ Veja: `prisma/schema.prisma`

### Quero fazer deploy
➡️ Leia: `README.md` (seção Deploy)

### Quero adicionar uma feature
➡️ Leia: `ARCHITECTURE.md` + `PROJECT_STRUCTURE.md`

### Quero testar a API
➡️ Acesse: http://localhost:3000/api (Swagger)

## 🔍 Busca Rápida

### Onde está...

**Autenticação JWT?**
- `src/auth/strategies/jwt.strategy.ts`
- `src/auth/guards/jwt-auth.guard.ts`

**Lógica de parcelamento?**
- `src/transactions/transactions.service.ts` (método `createInstallment`)

**Cálculo de fatura?**
- `src/invoices/invoices.service.ts` (método `getOrCreateInvoiceForTransaction`)

**Schema do banco?**
- `prisma/schema.prisma`

**Validações de DTO?**
- Cada módulo tem pasta `dto/`

**Dashboard/métricas?**
- `src/dashboard/dashboard.service.ts`

**Configuração de ambiente?**
- `.env` (local)
- `.env.example` (template)

**Setup do Docker?**
- `docker-compose.yml`
- `Dockerfile`

## 📈 Complexidade dos Arquivos

### Mais Complexos (requerem mais atenção)
1. `src/transactions/transactions.service.ts` (~350 linhas)
   - Parcelamento
   - Recorrência
   - Transferências

2. `src/invoices/invoices.service.ts` (~180 linhas)
   - Cálculo de datas
   - Gestão de status

3. `src/dashboard/dashboard.service.ts` (~200 linhas)
   - Agregações
   - Cálculos financeiros

4. `src/categories/categories.service.ts` (~150 linhas)
   - Hierarquia
   - Validação de ciclos

### Médios
- `src/accounts/accounts.service.ts` (~140 linhas)
- `src/users/users.service.ts` (~90 linhas)

### Simples
- Controllers (~40-70 linhas cada)
- DTOs (~20-40 linhas cada)
- Modules (~10-20 linhas cada)

## 🎨 Convenções do Código

### Nomenclatura
- **Arquivos**: kebab-case (`user.service.ts`)
- **Classes**: PascalCase (`UserService`)
- **Métodos**: camelCase (`findOne()`)
- **Constantes**: UPPER_SNAKE_CASE

### Estrutura de Módulo
```
module/
├── dto/                 # Data Transfer Objects
├── module.controller.ts # Endpoints HTTP
├── module.service.ts    # Lógica de negócio
└── module.module.ts     # Definição do módulo
```

### Padrões
- Controllers apenas roteiam para services
- Services contêm lógica de negócio
- DTOs validam entrada de dados
- Prisma service é injetado via DI

## 🔗 Links Úteis

### Quando o servidor estiver rodando
- API: http://localhost:3000
- Swagger: http://localhost:3000/api
- Prisma Studio: http://localhost:5555 (após `npm run prisma:studio`)
- PgAdmin: http://localhost:5050 (se usando Docker)

## 📦 Próximos Passos

1. ✅ Projeto criado
2. ⏭️ Execute: `npm install`
3. ⏭️ Configure: `.env`
4. ⏭️ Suba o banco: `docker-compose up -d`
5. ⏭️ Execute migrations: `npm run prisma:migrate`
6. ⏭️ Popule dados: `npm run prisma:seed`
7. ⏭️ Inicie: `npm run start:dev`
8. ⏭️ Acesse: http://localhost:3000/api

---

**Última atualização:** Outubro 2025
**Versão:** 1.0.0
**Status:** ✅ Completo e pronto para uso
