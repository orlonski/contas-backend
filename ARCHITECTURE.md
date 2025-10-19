# Arquitetura do Sistema

## Visão Geral

Este documento descreve a arquitetura do sistema de controle financeiro, suas decisões de design e fluxos principais.

## Arquitetura em Camadas

```
┌─────────────────────────────────────┐
│          Controllers                │
│   (Recebe requisições HTTP)         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          Services                   │
│   (Lógica de negócio)              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          Prisma ORM                 │
│   (Camada de acesso a dados)       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          PostgreSQL                 │
│   (Banco de dados)                 │
└─────────────────────────────────────┘
```

## Módulos do Sistema

### 1. Auth Module
**Responsabilidade**: Autenticação e autorização

**Componentes**:
- `AuthService`: Validação de credenciais e geração de tokens
- `JwtStrategy`: Estratégia de validação JWT
- `LocalStrategy`: Estratégia de validação local
- `JwtAuthGuard`: Guard para proteger rotas

**Fluxo de Autenticação**:
1. Usuário envia email/senha
2. `LocalStrategy` valida credenciais
3. `AuthService` gera token JWT
4. Token é retornado ao cliente
5. Cliente envia token em requisições futuras
6. `JwtStrategy` valida token
7. `JwtAuthGuard` permite acesso

### 2. Users Module
**Responsabilidade**: Gestão de usuários

**Componentes**:
- `UsersService`: CRUD de usuários
- `UsersController`: Endpoints de usuário

**Segurança**:
- Senhas são hasheadas com bcrypt (10 rounds)
- Senhas nunca são retornadas em respostas

### 3. Accounts Module
**Responsabilidade**: Gestão de contas bancárias e cartões

**Tipos de Conta**:
- `CHECKING`: Conta Corrente
- `SAVINGS`: Poupança
- `CREDIT_CARD`: Cartão de Crédito

**Regras Especiais para Cartão de Crédito**:
- Requer: `dueDay`, `closingDay`, `creditLimit`
- Dias devem estar entre 1 e 31
- Saldo não é calculado diretamente (ver faturas)

### 4. Categories Module
**Responsabilidade**: Gestão de categorias hierárquicas

**Características**:
- Suporta hierarquia (categoria pai/filho)
- Tipos: `EXPENSE` ou `INCOME`
- Validações contra ciclos hierárquicos
- Não permite deletar categoria com filhos

**Estrutura de Árvore**:
```
Alimentação (pai)
├── Restaurantes (filho)
├── Supermercado (filho)
└── Delivery (filho)
```

### 5. Transactions Module
**Responsabilidade**: Gestão de transações financeiras

**Tipos de Transação**:
- `EXPENSE`: Despesa
- `INCOME`: Receita
- `TRANSFER`: Transferência entre contas

**Tipos de Recorrência**:
- `SIMPLE`: Transação única
- `INSTALLMENT`: Parcelada (N parcelas)
- `RECURRING`: Recorrência avançada

**Fluxo de Criação de Parcelamento**:
```
1. Recebe: totalAmount, totalInstallments, date
2. Calcula: installmentAmount = totalAmount / totalInstallments
3. Gera: seriesId único (UUID)
4. Para cada parcela:
   a. Calcula data (mês + i)
   b. Se cartão de crédito:
      - Calcula fatura baseado em closingDay
      - Cria/busca fatura
      - Vincula transação à fatura
   c. Cria transação com seriesId
5. Retorna: array de transações criadas
```

**Fluxo de Recorrência Avançada**:
```
1. Recebe: intervalNumber, intervalUnit, isIndefinite, occurrences
2. Gera: seriesId único
3. Define: maxOccurrences (12 se indefinido, senão occurrences)
4. Para cada ocorrência:
   a. Calcula data baseado em intervalUnit
   b. Cria transação com seriesId
5. Retorna: array de transações criadas
```

### 6. Invoices Module
**Responsabilidade**: Gestão de faturas de cartão de crédito

**Cálculo de Fatura**:
```javascript
// Se transação foi feita ANTES do fechamento:
// → vai para fatura do mês atual

// Se transação foi feita DEPOIS do fechamento:
// → vai para fatura do próximo mês

Exemplo:
- Fechamento: dia 10
- Transação dia 05: fatura do mês atual
- Transação dia 15: fatura do próximo mês
```

**Status de Fatura**:
- `OPEN`: Fatura aberta (antes do fechamento)
- `CLOSED`: Fatura fechada (após fechamento)
- `PAID`: Fatura paga

**Fluxo de Cálculo de Datas**:
```
1. Recebe: transactionDate, closingDay
2. Extrai: day, month, year da transação
3. Se day > closingDay:
   month++
   se month > 12: month = 1, year++
4. Calcula closingDate: year-month-closingDay
5. Calcula dueDate: year-month-dueDay
6. Se dueDay < closingDay:
   dueDate.month++
7. Retorna: invoiceMonth, invoiceYear
```

### 7. Dashboard Module
**Responsabilidade**: Agregação de dados e métricas

**Endpoints**:

#### Saldo Consolidado
```
- Busca todas as contas ativas (exceto cartões)
- Para cada conta:
  - Calcula saldo inicial + transações
  - Receitas somam, despesas subtraem
- Retorna: saldo por conta + total
```

#### Resultado do Período
```
Filtros:
- currentMonth: início do mês até hoje
- remainingMonth: amanhã até fim do mês
- fullMonth: mês completo

Cálculo:
- Soma todas as receitas do período
- Soma todas as despesas do período
- Balance = receitas - despesas
```

#### Despesas por Categoria
```
- Agrupa transações por categoryId
- Soma valores por categoria
- Ordena por valor (maior primeiro)
- Retorna: array de categorias com totais
```

#### Fluxo de Caixa
```
- Busca transações dos últimos N meses
- Agrupa por mês (YYYY-MM)
- Para cada mês:
  - Soma receitas
  - Soma despesas
  - Calcula balance
- Retorna: array ordenado por mês
```

## Decisões de Design

### 1. Por que Prisma?
- Type safety completo
- Migrations automáticas
- Query builder intuitivo
- Excelente DX (Developer Experience)
- Proteção contra SQL injection

### 2. Por que JWT?
- Stateless (não requer sessão no servidor)
- Escalável
- Pode incluir claims customizados
- Amplamente suportado

### 3. Por que Decimal no Prisma?
- Precisão em cálculos financeiros
- Evita erros de arredondamento do float
- Essencial para dinheiro

### 4. Por que UUID como ID?
- Não expõe quantidade de registros
- Permite geração distribuída
- Mais seguro que auto-increment

### 5. Por que Soft Delete não foi usado?
- Simplicidade inicial
- Delete cascade do Prisma
- Pode ser adicionado depois se necessário

## Padrões Utilizados

### 1. Repository Pattern (via Prisma)
```typescript
// PrismaService encapsula o cliente Prisma
// Services usam PrismaService para acesso a dados
```

### 2. DTO Pattern
```typescript
// CreateDto: validação de criação
// UpdateDto: validação de atualização
// Class-validator para validações
```

### 3. Guard Pattern
```typescript
// JwtAuthGuard protege rotas
// Aplicado via @UseGuards(JwtAuthGuard)
```

### 4. Decorator Pattern
```typescript
// @CurrentUser() para extrair usuário do request
// @ApiTags(), @ApiOperation() para Swagger
```

## Segurança

### Autenticação
- Bcrypt para hash de senhas (10 rounds)
- JWT com expiração configurável
- Secret key em variável de ambiente

### Autorização
- Todos os endpoints protegidos (exceto auth)
- Validação de ownership (userId)
- Guards em todos os controllers

### Validação
- class-validator em todos os DTOs
- Whitelist: remove campos não definidos
- ForbidNonWhitelisted: rejeita campos extras
- Transform: converte tipos automaticamente

### SQL Injection
- Prisma protege automaticamente
- Queries parametrizadas

## Performance

### Otimizações Implementadas
- Índices automáticos do Prisma (PK, FK, unique)
- Eager loading com `include` quando necessário
- Queries otimizadas (select apenas campos necessários)

### Otimizações Futuras
- Cache (Redis)
- Paginação em listagens
- Índices customizados para queries frequentes
- Query optimization no dashboard

## Escalabilidade

### Horizontal
- Stateless (JWT)
- Pode rodar múltiplas instâncias
- Load balancer distribuiria carga

### Vertical
- PostgreSQL suporta alto volume
- Connection pooling do Prisma
- Pode aumentar recursos do servidor

## Monitoramento e Logging

### Implementado
- Logs do NestJS (console)
- Erros estruturados (NotFoundException, etc.)

### Recomendado para Produção
- Winston ou Pino para logging estruturado
- Sentry para error tracking
- Prometheus + Grafana para métricas
- APM (Application Performance Monitoring)

## Testes

### Estrutura Recomendada
```
src/
├── users/
│   ├── users.service.ts
│   ├── users.service.spec.ts     # Testes unitários
│   ├── users.controller.ts
│   └── users.controller.spec.ts  # Testes unitários

test/
├── users.e2e-spec.ts              # Testes E2E
└── auth.e2e-spec.ts               # Testes E2E
```

### Cobertura Recomendada
- Services: 80%+
- Controllers: 70%+
- E2E: Fluxos principais

## Deploy

### Variáveis de Ambiente Necessárias
```
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
PORT
NODE_ENV
```

### Checklist de Deploy
- [ ] Configurar DATABASE_URL de produção
- [ ] Gerar JWT_SECRET forte (32+ caracteres)
- [ ] Configurar CORS corretamente
- [ ] Executar migrations
- [ ] Configurar SSL no PostgreSQL
- [ ] Configurar health checks
- [ ] Configurar logs estruturados
- [ ] Configurar backups do banco

### Plataformas Recomendadas
- **Backend**: Railway, Render, Heroku, AWS
- **Banco**: Railway, Supabase, AWS RDS
- **Container**: Docker + Kubernetes (se necessário)

## Diagramas

### Fluxo de Autenticação
```
Cliente                    Backend                    Database
  │                          │                           │
  │  POST /auth/login        │                           │
  │─────────────────────────>│                           │
  │                          │  findByEmail              │
  │                          │──────────────────────────>│
  │                          │<──────────────────────────│
  │                          │  compare password         │
  │                          │  (bcrypt)                 │
  │                          │  generate JWT             │
  │  { access_token }        │                           │
  │<─────────────────────────│                           │
  │                          │                           │
  │  GET /users/me           │                           │
  │  Authorization: Bearer   │                           │
  │─────────────────────────>│                           │
  │                          │  validate JWT             │
  │                          │  extract userId           │
  │                          │  findOne(userId)          │
  │                          │──────────────────────────>│
  │                          │<──────────────────────────│
  │  { user data }           │                           │
  │<─────────────────────────│                           │
```

### Fluxo de Criação de Parcelamento
```
Cliente                    Backend                    Database
  │                          │                           │
  │  POST /transactions      │                           │
  │  {                       │                           │
  │    type: EXPENSE,        │                           │
  │    recurrenceType:       │                           │
  │      INSTALLMENT,        │                           │
  │    totalAmount: 1000,    │                           │
  │    totalInstallments:10, │                           │
  │    creditCardId: xxx     │                           │
  │  }                       │                           │
  │─────────────────────────>│                           │
  │                          │  validate account         │
  │                          │──────────────────────────>│
  │                          │<──────────────────────────│
  │                          │  for i in 10:             │
  │                          │    calculate date         │
  │                          │    calculate invoice      │
  │                          │    create transaction     │
  │                          │──────────────────────────>│
  │                          │<──────────────────────────│
  │  [10 transactions]       │                           │
  │<─────────────────────────│                           │
```

## Manutenção

### Migrations
```bash
# Criar migration
npx prisma migrate dev --name description

# Aplicar migrations em produção
npx prisma migrate deploy

# Reset database (CUIDADO!)
npx prisma migrate reset
```

### Backup
```bash
# PostgreSQL backup
pg_dump -U user -d contas_db > backup.sql

# Restore
psql -U user -d contas_db < backup.sql
```

## Referências

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
