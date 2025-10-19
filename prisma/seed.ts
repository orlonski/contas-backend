import { PrismaClient, AccountType, CategoryType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Criar usuário de exemplo
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  console.log('✅ User created:', user.email);

  // Criar contas de exemplo
  const contaCorrente = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Conta Corrente Nubank',
      initialBalance: 1000.0,
      type: AccountType.CHECKING,
      isActive: true,
    },
  });

  const poupanca = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Poupança Caixa',
      initialBalance: 5000.0,
      type: AccountType.SAVINGS,
      isActive: true,
    },
  });

  const cartao = await prisma.account.create({
    data: {
      userId: user.id,
      name: 'Cartão Nubank',
      initialBalance: 0,
      type: AccountType.CREDIT_CARD,
      isActive: true,
      dueDay: 15,
      closingDay: 8,
      creditLimit: 5000.0,
      bank: 'Nubank',
    },
  });

  console.log('✅ Accounts created');

  // Criar categorias de despesa
  const alimentacao = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Alimentação',
      icon: 'utensils',
      type: CategoryType.EXPENSE,
    },
  });

  await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Restaurantes',
      icon: 'restaurant',
      type: CategoryType.EXPENSE,
      parentId: alimentacao.id,
    },
  });

  await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Supermercado',
      icon: 'shopping-cart',
      type: CategoryType.EXPENSE,
      parentId: alimentacao.id,
    },
  });

  const transporte = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Transporte',
      icon: 'car',
      type: CategoryType.EXPENSE,
    },
  });

  await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Combustível',
      icon: 'gas-pump',
      type: CategoryType.EXPENSE,
      parentId: transporte.id,
    },
  });

  await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Uber/99',
      icon: 'taxi',
      type: CategoryType.EXPENSE,
      parentId: transporte.id,
    },
  });

  const moradia = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Moradia',
      icon: 'home',
      type: CategoryType.EXPENSE,
    },
  });

  await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Aluguel',
      icon: 'key',
      type: CategoryType.EXPENSE,
      parentId: moradia.id,
    },
  });

  await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Contas de Luz/Água',
      icon: 'lightbulb',
      type: CategoryType.EXPENSE,
      parentId: moradia.id,
    },
  });

  // Categorias de receita
  const salario = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Salário',
      icon: 'money',
      type: CategoryType.INCOME,
    },
  });

  const freelance = await prisma.category.create({
    data: {
      userId: user.id,
      name: 'Freelance',
      icon: 'briefcase',
      type: CategoryType.INCOME,
    },
  });

  console.log('✅ Categories created');

  // Criar transações de exemplo
  const now = new Date();

  // Receita
  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: contaCorrente.id,
      categoryId: salario.id,
      amount: 5000.0,
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      description: 'Salário do mês',
      type: 'INCOME',
    },
  });

  // Despesas
  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: contaCorrente.id,
      categoryId: alimentacao.id,
      amount: 150.0,
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      description: 'Compras no supermercado',
      type: 'EXPENSE',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: contaCorrente.id,
      categoryId: transporte.id,
      amount: 200.0,
      date: new Date(now.getFullYear(), now.getMonth(), 12),
      description: 'Gasolina',
      type: 'EXPENSE',
    },
  });

  console.log('✅ Transactions created');

  console.log('🎉 Seeding completed!');
  console.log('\n📝 Demo credentials:');
  console.log('   Email: demo@example.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
