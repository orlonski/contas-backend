# 🚀 COMECE AQUI!

## Você tem 2 opções:

### 1️⃣ Rodar Localmente (Desenvolvimento)

**Leia este arquivo:** [START_LOCAL.md](START_LOCAL.md)

Resumo dos passos:
```bash
# 1. Instalar PostgreSQL no Windows
# 2. Criar banco: contas_db
# 3. Configurar .env com sua senha
# 4. Instalar dependências
npm install

# 5. Gerar Prisma Client
npm run prisma:generate

# 6. Executar migrations
npm run prisma:migrate

# 7. Popular banco (opcional)
npm run prisma:seed

# 8. Iniciar servidor
npm run start:dev

# 9. Acessar Swagger
# http://localhost:3000/api
```

**Tempo estimado:** 15-20 minutos

---

### 2️⃣ Deploy no EasyPanel (Produção)

**Leia este arquivo:** [EASYPANEL_DEPLOY.md](EASYPANEL_DEPLOY.md)

Resumo dos passos:
1. Criar repositório no GitHub
2. Fazer push do código
3. Criar projeto no EasyPanel
4. Adicionar PostgreSQL
5. Adicionar App conectada ao GitHub
6. Configurar variáveis de ambiente
7. Deploy automático!

**Tempo estimado:** 10-15 minutos

---

## 📚 Documentação Completa

Depois que estiver rodando, explore:

- **[README.md](README.md)** - Visão geral do projeto
- **[API_EXAMPLES.md](API_EXAMPLES.md)** - Exemplos de uso da API
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Como funciona por dentro
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Estrutura dos arquivos

---

## ❓ Precisa de Ajuda?

### PostgreSQL não está instalado?
→ Leia: [START_LOCAL.md](START_LOCAL.md) - Seção "Instalar PostgreSQL"

### Quer fazer deploy?
→ Leia: [EASYPANEL_DEPLOY.md](EASYPANEL_DEPLOY.md)

### Quer entender o código?
→ Leia: [ARCHITECTURE.md](ARCHITECTURE.md)

### Quer ver exemplos de API?
→ Leia: [API_EXAMPLES.md](API_EXAMPLES.md)

---

## 🎯 Checklist Rápido

### Para Desenvolvimento Local:
- [ ] PostgreSQL instalado
- [ ] Banco `contas_db` criado
- [ ] `.env` configurado com senha correta
- [ ] `npm install` executado
- [ ] `npm run prisma:generate` executado
- [ ] `npm run prisma:migrate` executado
- [ ] `npm run start:dev` rodando
- [ ] Swagger acessível em http://localhost:3000/api

### Para Deploy EasyPanel:
- [ ] Código no GitHub
- [ ] Projeto criado no EasyPanel
- [ ] PostgreSQL criado no EasyPanel
- [ ] App conectada ao GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy executado com sucesso
- [ ] API acessível na URL do EasyPanel

---

## 💡 Recomendação

**Se é a primeira vez:**
1. Rode localmente primeiro usando [START_LOCAL.md](START_LOCAL.md)
2. Teste a API no Swagger: http://localhost:3000/api
3. Quando estiver funcionando, faça deploy usando [EASYPANEL_DEPLOY.md](EASYPANEL_DEPLOY.md)

**Sucesso!** 🎉
