import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountType, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtém o saldo consolidado de todas as contas (exceto cartões de crédito)
   */
  async getConsolidatedBalance(userId: string) {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
        isActive: true,
        type: {
          not: AccountType.CREDIT_CARD,
        },
      },
    });

    const balances = await Promise.all(
      accounts.map(async (account) => {
        const transactions = await this.prisma.transaction.findMany({
          where: {
            accountId: account.id,
            date: {
              lte: new Date(),
            },
          },
        });

        let balance = new Decimal(account.initialBalance.toString());

        for (const transaction of transactions) {
          if (transaction.type === TransactionType.INCOME) {
            balance = balance.add(new Decimal(transaction.amount.toString()));
          } else if (transaction.type === TransactionType.EXPENSE) {
            balance = balance.sub(new Decimal(transaction.amount.toString()));
          }
        }

        return {
          accountId: account.id,
          accountName: account.name,
          type: account.type,
          balance,
        };
      }),
    );

    const total = balances.reduce((sum, b) => sum.add(b.balance), new Decimal(0));

    return {
      total,
      accounts: balances,
    };
  }

  /**
   * Obtém o resultado do período (receitas vs despesas)
   */
  async getPeriodResult(userId: string, filter: 'currentMonth' | 'remainingMonth' | 'fullMonth') {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (filter) {
      case 'currentMonth':
        // Do início do mês até hoje
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;

      case 'remainingMonth':
        // De amanhã até o fim do mês
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último dia do mês
        break;

      case 'fullMonth':
        // Mês completo
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        type: {
          in: [TransactionType.INCOME, TransactionType.EXPENSE],
        },
      },
    });

    let totalIncome = new Decimal(0);
    let totalExpense = new Decimal(0);

    for (const transaction of transactions) {
      if (transaction.type === TransactionType.INCOME) {
        totalIncome = totalIncome.add(new Decimal(transaction.amount.toString()));
      } else if (transaction.type === TransactionType.EXPENSE) {
        totalExpense = totalExpense.add(new Decimal(transaction.amount.toString()));
      }
    }

    const balance = totalIncome.sub(totalExpense);

    return {
      filter,
      period: {
        start: startDate,
        end: endDate,
      },
      totalIncome,
      totalExpense,
      balance,
    };
  }

  /**
   * Obtém despesas agrupadas por categoria
   */
  async getExpensesByCategory(userId: string, startDate?: Date, endDate?: Date) {
    if (!startDate) {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (!endDate) {
      const now = new Date();
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    // Agrupar por categoria
    const grouped = transactions.reduce((acc, transaction) => {
      const categoryId = transaction.categoryId || 'uncategorized';
      const categoryName = transaction.category?.name || 'Sem Categoria';

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          categoryName,
          total: new Decimal(0),
          count: 0,
          transactions: [],
        };
      }

      acc[categoryId].total = acc[categoryId].total.add(
        new Decimal(transaction.amount.toString()),
      );
      acc[categoryId].count++;
      acc[categoryId].transactions.push(transaction);

      return acc;
    }, {});

    const result = Object.values(grouped).sort((a: any, b: any) => {
      return b.total.comparedTo(a.total);
    });

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      categories: result,
    };
  }

  /**
   * Obtém fluxo de caixa (histórico de entradas e saídas ao longo do tempo)
   */
  async getCashFlow(userId: string, months: number = 12) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
        type: {
          in: [TransactionType.INCOME, TransactionType.EXPENSE],
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Agrupar por mês
    const monthlyData = {};

    for (const transaction of transactions) {
      const monthKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: new Decimal(0),
          expense: new Decimal(0),
          balance: new Decimal(0),
        };
      }

      if (transaction.type === TransactionType.INCOME) {
        monthlyData[monthKey].income = monthlyData[monthKey].income.add(
          new Decimal(transaction.amount.toString()),
        );
      } else if (transaction.type === TransactionType.EXPENSE) {
        monthlyData[monthKey].expense = monthlyData[monthKey].expense.add(
          new Decimal(transaction.amount.toString()),
        );
      }
    }

    // Calcular balance de cada mês
    Object.keys(monthlyData).forEach((monthKey) => {
      monthlyData[monthKey].balance = monthlyData[monthKey].income.sub(
        monthlyData[monthKey].expense,
      );
    });

    return {
      months: months,
      data: Object.values(monthlyData),
    };
  }

  /**
   * Resumo geral do dashboard
   */
  async getSummary(userId: string) {
    const consolidatedBalance = await this.getConsolidatedBalance(userId);
    const currentMonth = await this.getPeriodResult(userId, 'currentMonth');
    const remainingMonth = await this.getPeriodResult(userId, 'remainingMonth');

    return {
      consolidatedBalance,
      currentMonth,
      remainingMonth,
    };
  }
}
