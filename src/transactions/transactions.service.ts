import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {
  TransactionType,
  RecurrenceType,
  AccountType,
  IntervalUnit,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private invoicesService: InvoicesService,
  ) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const {
      accountId,
      categoryId,
      type,
      recurrenceType,
      transferToId,
      creditCardId,
      ...rest
    } = createTransactionDto;

    // Validar conta
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    // Validar categoria
    if (categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: categoryId, userId },
      });

      if (!category) {
        throw new NotFoundException('Categoria não encontrada');
      }
    }

    // Validações específicas por tipo
    if (type === TransactionType.TRANSFER) {
      return this.createTransfer(userId, createTransactionDto);
    }

    if (recurrenceType === RecurrenceType.INSTALLMENT) {
      return this.createInstallment(userId, createTransactionDto);
    }

    if (recurrenceType === RecurrenceType.RECURRING) {
      return this.createRecurring(userId, createTransactionDto);
    }

    // Transação simples
    let invoiceId = null;
    if (creditCardId) {
      invoiceId = await this.invoicesService.getOrCreateInvoiceForTransaction(
        creditCardId,
        createTransactionDto.date,
      );
    }

    return this.prisma.transaction.create({
      data: {
        userId,
        accountId,
        categoryId,
        type,
        recurrenceType: RecurrenceType.SIMPLE,
        invoiceId,
        ...rest,
      },
    });
  }

  private async createTransfer(userId: string, dto: CreateTransactionDto) {
    if (!dto.transferToId) {
      throw new BadRequestException('Transferência requer conta de destino');
    }

    const accountFrom = await this.prisma.account.findFirst({
      where: { id: dto.accountId, userId },
    });

    const accountTo = await this.prisma.account.findFirst({
      where: { id: dto.transferToId, userId },
    });

    if (!accountFrom || !accountTo) {
      throw new NotFoundException('Conta origem ou destino não encontrada');
    }

    // Criar transação de débito
    const debit = await this.prisma.transaction.create({
      data: {
        userId,
        accountId: dto.accountId,
        amount: dto.amount,
        date: dto.date,
        description: dto.description,
        type: TransactionType.TRANSFER,
        transferToId: dto.transferToId,
        recurrenceType: RecurrenceType.SIMPLE,
      },
    });

    // Criar transação de crédito
    const credit = await this.prisma.transaction.create({
      data: {
        userId,
        accountId: dto.transferToId,
        amount: dto.amount,
        date: dto.date,
        description: dto.description,
        type: TransactionType.TRANSFER,
        transferFromId: dto.accountId,
        recurrenceType: RecurrenceType.SIMPLE,
      },
    });

    return { debit, credit };
  }

  private async createInstallment(userId: string, dto: CreateTransactionDto) {
    const { totalInstallments, totalAmount, date, creditCardId } = dto;

    if (!totalInstallments || !totalAmount) {
      throw new BadRequestException('Parcelamento requer número de parcelas e valor total');
    }

    const installmentAmount = Number(totalAmount) / totalInstallments;
    const seriesId = uuidv4();
    const transactions = [];

    // Se for em cartão de crédito, buscar informações de fechamento
    let account = null;
    if (creditCardId) {
      account = await this.prisma.account.findFirst({
        where: { id: creditCardId, userId, type: AccountType.CREDIT_CARD },
      });

      if (!account) {
        throw new NotFoundException('Cartão de crédito não encontrado');
      }
    }

    for (let i = 0; i < totalInstallments; i++) {
      const installmentDate = new Date(date);
      installmentDate.setMonth(installmentDate.getMonth() + i);

      let invoiceId = null;
      if (creditCardId && account) {
        invoiceId = await this.invoicesService.getOrCreateInvoiceForTransaction(
          creditCardId,
          installmentDate,
        );
      }

      const transaction = await this.prisma.transaction.create({
        data: {
          userId,
          accountId: dto.accountId,
          categoryId: dto.categoryId,
          amount: installmentAmount,
          date: installmentDate,
          description: `${dto.description} (${i + 1}/${totalInstallments})`,
          type: dto.type,
          recurrenceType: RecurrenceType.INSTALLMENT,
          installmentStart: i + 1,
          installmentEnd: totalInstallments,
          totalInstallments,
          totalAmount,
          seriesId,
          creditCardId,
          invoiceId,
        },
      });

      transactions.push(transaction);
    }

    return transactions;
  }

  private async createRecurring(userId: string, dto: CreateTransactionDto) {
    const { intervalNumber, intervalUnit, isIndefinite, occurrences, date } = dto;

    if (!intervalNumber || !intervalUnit) {
      throw new BadRequestException('Recorrência requer intervalo e unidade');
    }

    if (!isIndefinite && !occurrences) {
      throw new BadRequestException('Recorrência não indefinida requer número de ocorrências');
    }

    const seriesId = uuidv4();
    const transactions = [];
    const maxOccurrences = isIndefinite ? 12 : occurrences; // Limite de 12 meses se indefinido

    for (let i = 0; i < maxOccurrences; i++) {
      const transactionDate = new Date(date);

      switch (intervalUnit) {
        case IntervalUnit.DAY:
          transactionDate.setDate(transactionDate.getDate() + i * intervalNumber);
          break;
        case IntervalUnit.WEEK:
          transactionDate.setDate(transactionDate.getDate() + i * intervalNumber * 7);
          break;
        case IntervalUnit.MONTH:
          transactionDate.setMonth(transactionDate.getMonth() + i * intervalNumber);
          break;
        case IntervalUnit.YEAR:
          transactionDate.setFullYear(transactionDate.getFullYear() + i * intervalNumber);
          break;
      }

      const transaction = await this.prisma.transaction.create({
        data: {
          userId,
          accountId: dto.accountId,
          categoryId: dto.categoryId,
          amount: dto.amount,
          date: transactionDate,
          description: dto.description,
          type: dto.type,
          recurrenceType: RecurrenceType.RECURRING,
          intervalNumber,
          intervalUnit,
          isIndefinite,
          occurrences,
          seriesId,
        },
      });

      transactions.push(transaction);
    }

    return transactions;
  }

  async findAll(
    userId: string,
    accountId?: string,
    startDate?: Date,
    endDate?: Date,
    type?: TransactionType,
  ) {
    const where: any = { userId };

    if (accountId) {
      where.accountId = accountId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    if (type) {
      where.type = type;
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        account: true,
        category: true,
        invoice: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findByInvoice(invoiceId: string, userId: string) {
    // Validar que a fatura pertence ao usuário
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        account: {
          userId,
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada');
    }

    return this.prisma.transaction.findMany({
      where: { invoiceId },
      include: {
        category: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        account: true,
        category: true,
        invoice: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async update(id: string, userId: string, updateTransactionDto: UpdateTransactionDto) {
    const transaction = await this.findOne(id, userId);

    return this.prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
    });
  }

  async updateSeries(seriesId: string, userId: string, updateTransactionDto: UpdateTransactionDto) {
    // Verificar se existe alguma transação da série
    const seriesTransactions = await this.prisma.transaction.findMany({
      where: { seriesId, userId },
    });

    if (seriesTransactions.length === 0) {
      throw new NotFoundException('Série de transações não encontrada');
    }

    // Atualizar todas as transações da série
    return this.prisma.transaction.updateMany({
      where: { seriesId, userId },
      data: updateTransactionDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.transaction.delete({
      where: { id },
    });

    return { message: 'Transação removida com sucesso' };
  }

  async removeSeries(seriesId: string, userId: string) {
    const seriesTransactions = await this.prisma.transaction.findMany({
      where: { seriesId, userId },
    });

    if (seriesTransactions.length === 0) {
      throw new NotFoundException('Série de transações não encontrada');
    }

    await this.prisma.transaction.deleteMany({
      where: { seriesId, userId },
    });

    return {
      message: 'Série de transações removida com sucesso',
      deletedCount: seriesTransactions.length,
    };
  }
}
