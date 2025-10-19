# Exemplos de Uso da API

Este documento contém exemplos práticos de como usar a API do sistema de controle financeiro.

## Autenticação

### 1. Registrar Novo Usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## Contas

### 1. Criar Conta Corrente

```bash
curl -X POST http://localhost:3000/accounts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Conta Corrente Nubank",
    "initialBalance": 1000.00,
    "type": "CHECKING",
    "isActive": true
  }'
```

### 2. Criar Cartão de Crédito

```bash
curl -X POST http://localhost:3000/accounts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cartão Nubank",
    "initialBalance": 0,
    "type": "CREDIT_CARD",
    "isActive": true,
    "dueDay": 15,
    "closingDay": 8,
    "creditLimit": 5000.00,
    "bank": "Nubank"
  }'
```

### 3. Listar Contas Ativas

```bash
curl -X GET "http://localhost:3000/accounts?activeOnly=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Obter Saldo de uma Conta

```bash
curl -X GET http://localhost:3000/accounts/{accountId}/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Categorias

### 1. Criar Categoria Principal

```bash
curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alimentação",
    "icon": "utensils",
    "type": "EXPENSE"
  }'
```

### 2. Criar Subcategoria

```bash
curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Restaurantes",
    "icon": "restaurant",
    "type": "EXPENSE",
    "parentId": "PARENT_CATEGORY_ID"
  }'
```

### 3. Listar Categorias em Árvore

```bash
curl -X GET http://localhost:3000/categories/tree \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Transações

### 1. Criar Despesa Simples

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "categoryId": "CATEGORY_ID",
    "amount": 150.50,
    "date": "2025-01-15T00:00:00.000Z",
    "description": "Compras no supermercado",
    "type": "EXPENSE",
    "recurrenceType": "SIMPLE"
  }'
```

### 2. Criar Receita

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "categoryId": "CATEGORY_ID",
    "amount": 5000.00,
    "date": "2025-01-05T00:00:00.000Z",
    "description": "Salário do mês",
    "type": "INCOME",
    "recurrenceType": "SIMPLE"
  }'
```

### 3. Criar Transferência entre Contas

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_FROM_ID",
    "transferToId": "ACCOUNT_TO_ID",
    "amount": 500.00,
    "date": "2025-01-15T00:00:00.000Z",
    "description": "Transferência para poupança",
    "type": "TRANSFER"
  }'
```

### 4. Criar Despesa Parcelada no Cartão

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "categoryId": "CATEGORY_ID",
    "amount": 100.00,
    "totalAmount": 1000.00,
    "totalInstallments": 10,
    "date": "2025-01-15T00:00:00.000Z",
    "description": "Notebook Dell",
    "type": "EXPENSE",
    "recurrenceType": "INSTALLMENT",
    "creditCardId": "CREDIT_CARD_ID"
  }'
```

**Resultado:** Sistema cria 10 transações automaticamente, uma para cada parcela, distribuídas nas faturas corretas baseadas no dia de fechamento.

### 5. Criar Receita Recorrente Mensal

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_ID",
    "categoryId": "CATEGORY_ID",
    "amount": 5000.00,
    "date": "2025-01-05T00:00:00.000Z",
    "description": "Salário mensal",
    "type": "INCOME",
    "recurrenceType": "RECURRING",
    "intervalNumber": 1,
    "intervalUnit": "MONTH",
    "isIndefinite": false,
    "occurrences": 12
  }'
```

### 6. Listar Transações com Filtros

```bash
# Todas as transações
curl -X GET http://localhost:3000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Por conta específica
curl -X GET "http://localhost:3000/transactions?accountId=ACCOUNT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Por período
curl -X GET "http://localhost:3000/transactions?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Por tipo
curl -X GET "http://localhost:3000/transactions?type=EXPENSE" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Atualizar Transação Individual

```bash
curl -X PATCH http://localhost:3000/transactions/{transactionId} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200.00,
    "description": "Descrição atualizada"
  }'
```

### 8. Atualizar Série Completa

```bash
curl -X PATCH http://localhost:3000/transactions/series/{seriesId} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "NEW_CATEGORY_ID"
  }'
```

### 9. Deletar Transação Individual

```bash
curl -X DELETE http://localhost:3000/transactions/{transactionId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10. Deletar Série Completa

```bash
curl -X DELETE http://localhost:3000/transactions/series/{seriesId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Faturas

### 1. Listar Faturas de um Cartão

```bash
curl -X GET http://localhost:3000/invoices/card/{creditCardId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta:**
```json
[
  {
    "id": "invoice-id-1",
    "accountId": "credit-card-id",
    "month": 1,
    "year": 2025,
    "closingDate": "2025-01-08T00:00:00.000Z",
    "dueDate": "2025-01-15T00:00:00.000Z",
    "totalAmount": 1500.00,
    "status": "OPEN"
  },
  {
    "id": "invoice-id-2",
    "accountId": "credit-card-id",
    "month": 2,
    "year": 2025,
    "closingDate": "2025-02-08T00:00:00.000Z",
    "dueDate": "2025-02-15T00:00:00.000Z",
    "totalAmount": 1200.00,
    "status": "CLOSED"
  }
]
```

### 2. Detalhar Fatura

```bash
curl -X GET http://localhost:3000/invoices/{invoiceId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta:**
```json
{
  "id": "invoice-id",
  "accountId": "credit-card-id",
  "month": 1,
  "year": 2025,
  "closingDate": "2025-01-08T00:00:00.000Z",
  "dueDate": "2025-01-15T00:00:00.000Z",
  "totalAmount": 1500.00,
  "status": "OPEN",
  "account": {
    "id": "credit-card-id",
    "name": "Cartão Nubank",
    "creditLimit": 5000.00
  },
  "transactions": [
    {
      "id": "trans-1",
      "amount": 100.00,
      "date": "2025-01-10T00:00:00.000Z",
      "description": "Netflix",
      "category": {
        "name": "Assinaturas"
      }
    },
    {
      "id": "trans-2",
      "amount": 200.00,
      "date": "2025-01-12T00:00:00.000Z",
      "description": "Supermercado",
      "category": {
        "name": "Alimentação"
      }
    }
  ],
  "calculatedTotal": 1500.00
}
```

### 3. Marcar Fatura como Paga

```bash
curl -X PATCH http://localhost:3000/invoices/{invoiceId}/pay \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Fechar Fatura

```bash
curl -X PATCH http://localhost:3000/invoices/{invoiceId}/close \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Recalcular Total da Fatura

```bash
curl -X PATCH http://localhost:3000/invoices/{invoiceId}/recalculate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Dashboard

### 1. Resumo Geral

```bash
curl -X GET http://localhost:3000/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta:**
```json
{
  "consolidatedBalance": {
    "total": 6500.00,
    "accounts": [
      {
        "accountId": "acc-1",
        "accountName": "Conta Corrente",
        "type": "CHECKING",
        "balance": 1500.00
      },
      {
        "accountId": "acc-2",
        "accountName": "Poupança",
        "type": "SAVINGS",
        "balance": 5000.00
      }
    ]
  },
  "currentMonth": {
    "filter": "currentMonth",
    "period": {
      "start": "2025-01-01T00:00:00.000Z",
      "end": "2025-01-15T00:00:00.000Z"
    },
    "totalIncome": 5000.00,
    "totalExpense": 1200.00,
    "balance": 3800.00
  },
  "remainingMonth": {
    "filter": "remainingMonth",
    "period": {
      "start": "2025-01-16T00:00:00.000Z",
      "end": "2025-01-31T00:00:00.000Z"
    },
    "totalIncome": 0,
    "totalExpense": 800.00,
    "balance": -800.00
  }
}
```

### 2. Saldo Consolidado

```bash
curl -X GET http://localhost:3000/dashboard/consolidated-balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Resultado do Período

```bash
# Mês atual até hoje
curl -X GET "http://localhost:3000/dashboard/period-result?filter=currentMonth" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Amanhã até fim do mês
curl -X GET "http://localhost:3000/dashboard/period-result?filter=remainingMonth" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mês completo
curl -X GET "http://localhost:3000/dashboard/period-result?filter=fullMonth" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Despesas por Categoria

```bash
# Mês atual
curl -X GET http://localhost:3000/dashboard/expenses-by-category \
  -H "Authorization: Bearer YOUR_TOKEN"

# Período específico
curl -X GET "http://localhost:3000/dashboard/expenses-by-category?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta:**
```json
{
  "period": {
    "start": "2025-01-01T00:00:00.000Z",
    "end": "2025-01-31T00:00:00.000Z"
  },
  "categories": [
    {
      "categoryId": "cat-1",
      "categoryName": "Alimentação",
      "total": 800.00,
      "count": 15,
      "transactions": [...]
    },
    {
      "categoryId": "cat-2",
      "categoryName": "Transporte",
      "total": 400.00,
      "count": 8,
      "transactions": [...]
    }
  ]
}
```

### 5. Fluxo de Caixa

```bash
# Últimos 12 meses (padrão)
curl -X GET http://localhost:3000/dashboard/cash-flow \
  -H "Authorization: Bearer YOUR_TOKEN"

# Últimos 6 meses
curl -X GET "http://localhost:3000/dashboard/cash-flow?months=6" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta:**
```json
{
  "months": 12,
  "data": [
    {
      "month": "2024-02",
      "income": 5000.00,
      "expense": 3200.00,
      "balance": 1800.00
    },
    {
      "month": "2024-03",
      "income": 5000.00,
      "expense": 2800.00,
      "balance": 2200.00
    }
  ]
}
```

## Cenários Práticos

### Cenário 1: Compra Parcelada no Cartão

**Situação:** Comprei um notebook de R$ 3.000 em 10x no cartão que fecha dia 10 e vence dia 17.

```bash
# 1. Criar a transação parcelada
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "my-account-id",
    "categoryId": "electronics-category-id",
    "totalAmount": 3000.00,
    "totalInstallments": 10,
    "date": "2025-01-15T00:00:00.000Z",
    "description": "Notebook Dell",
    "type": "EXPENSE",
    "recurrenceType": "INSTALLMENT",
    "creditCardId": "my-credit-card-id"
  }'

# 2. Verificar as faturas criadas
curl -X GET http://localhost:3000/invoices/card/my-credit-card-id \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Ver detalhes da próxima fatura
curl -X GET http://localhost:3000/invoices/{next-invoice-id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cenário 2: Organizar Despesas do Mês

```bash
# 1. Ver quanto já gastei este mês
curl -X GET "http://localhost:3000/dashboard/period-result?filter=currentMonth" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Ver quanto ainda vou gastar
curl -X GET "http://localhost:3000/dashboard/period-result?filter=remainingMonth" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Ver em quais categorias gastei mais
curl -X GET http://localhost:3000/dashboard/expenses-by-category \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Ver saldo atual de todas as contas
curl -X GET http://localhost:3000/dashboard/consolidated-balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cenário 3: Configurar Despesas Recorrentes

```bash
# Aluguel mensal
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "my-account-id",
    "categoryId": "rent-category-id",
    "amount": 1500.00,
    "date": "2025-01-05T00:00:00.000Z",
    "description": "Aluguel",
    "type": "EXPENSE",
    "recurrenceType": "RECURRING",
    "intervalNumber": 1,
    "intervalUnit": "MONTH",
    "isIndefinite": false,
    "occurrences": 12
  }'

# Netflix mensal
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "my-account-id",
    "categoryId": "subscriptions-category-id",
    "amount": 45.90,
    "date": "2025-01-20T00:00:00.000Z",
    "description": "Netflix",
    "type": "EXPENSE",
    "recurrenceType": "RECURRING",
    "intervalNumber": 1,
    "intervalUnit": "MONTH",
    "isIndefinite": true
  }'
```

## Testando com Postman/Insomnia

Importe a coleção do Swagger acessando:
```
http://localhost:3000/api-json
```

Ou use a documentação interativa em:
```
http://localhost:3000/api
```
