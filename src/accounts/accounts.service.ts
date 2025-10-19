import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountType } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createAccountDto: CreateAccountDto) {
    const { type, dueDay, closingDay, creditLimit, bank, ...rest } = createAccountDto;

    // Validação específica para cartão de crédito
    if (type === AccountType.CREDIT_CARD) {
      if (!dueDay || !closingDay || !creditLimit) {
        throw new BadRequestException(
          'Cartão de crédito requer: dia de vencimento, dia de fechamento e limite',
        );
      }

      if (dueDay < 1 || dueDay > 31 || closingDay < 1 || closingDay > 31) {
        throw new BadRequestException('Dias devem estar entre 1 e 31');
      }
    }

    return this.prisma.account.create({
      data: {
        userId,
        type,
        dueDay: type === AccountType.CREDIT_CARD ? dueDay : null,
        closingDay: type === AccountType.CREDIT_CARD ? closingDay : null,
        creditLimit: type === AccountType.CREDIT_CARD ? creditLimit : null,
        bank: type === AccountType.CREDIT_CARD ? bank : null,
        ...rest,
      },
    });
  }

  async findAll(userId: string, activeOnly?: boolean) {
    return this.prisma.account.findMany({
      where: {
        userId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    return account;
  }

  async getCurrentBalance(id: string, userId: string) {
    const account = await this.findOne(id, userId);

    // Para cartão de crédito, não calculamos saldo da mesma forma
    if (account.type === AccountType.CREDIT_CARD) {
      return {
        accountId: id,
        accountName: account.name,
        type: account.type,
        creditLimit: account.creditLimit,
        message: 'Use o endpoint de faturas para ver o saldo do cartão',
      };
    }

    // Calcular saldo atual baseado nas transações
    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId: id,
        date: {
          lte: new Date(),
        },
      },
    });

    let balance = account.initialBalance;

    for (const transaction of transactions) {
      if (transaction.type === 'INCOME') {
        balance = balance.add(transaction.amount);
      } else if (transaction.type === 'EXPENSE') {
        balance = balance.sub(transaction.amount);
      }
    }

    return {
      accountId: id,
      accountName: account.name,
      type: account.type,
      initialBalance: account.initialBalance,
      currentBalance: balance,
    };
  }

  async update(id: string, userId: string, updateAccountDto: UpdateAccountDto) {
    await this.findOne(id, userId);

    const { type, dueDay, closingDay, creditLimit, bank, ...rest } = updateAccountDto;

    // Validação específica para cartão de crédito
    if (type === AccountType.CREDIT_CARD) {
      if (dueDay && (dueDay < 1 || dueDay > 31)) {
        throw new BadRequestException('Dia de vencimento deve estar entre 1 e 31');
      }
      if (closingDay && (closingDay < 1 || closingDay > 31)) {
        throw new BadRequestException('Dia de fechamento deve estar entre 1 e 31');
      }
    }

    return this.prisma.account.update({
      where: { id },
      data: {
        type,
        dueDay: type === AccountType.CREDIT_CARD ? dueDay : null,
        closingDay: type === AccountType.CREDIT_CARD ? closingDay : null,
        creditLimit: type === AccountType.CREDIT_CARD ? creditLimit : null,
        bank: type === AccountType.CREDIT_CARD ? bank : null,
        ...rest,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.account.delete({
      where: { id },
    });

    return { message: 'Conta removida com sucesso' };
  }
}
