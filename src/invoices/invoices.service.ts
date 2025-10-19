import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus, AccountType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtém ou cria uma fatura para uma transação baseada na data e dia de fechamento
   */
  async getOrCreateInvoiceForTransaction(creditCardId: string, transactionDate: Date): Promise<string> {
    const account = await this.prisma.account.findUnique({
      where: { id: creditCardId },
    });

    if (!account || account.type !== AccountType.CREDIT_CARD) {
      throw new BadRequestException('Conta não é um cartão de crédito');
    }

    const closingDay = account.closingDay;
    const dueDay = account.dueDay;

    // Calcular a qual fatura esta transação pertence
    const { month, year } = this.calculateInvoiceMonthYear(transactionDate, closingDay);

    // Calcular datas de fechamento e vencimento
    const closingDate = new Date(year, month - 1, closingDay);
    const dueDate = new Date(year, month - 1, dueDay);

    // Se o vencimento for antes do fechamento, é no próximo mês
    if (dueDay < closingDay) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    // Buscar ou criar a fatura
    let invoice = await this.prisma.invoice.findUnique({
      where: {
        accountId_month_year: {
          accountId: creditCardId,
          month,
          year,
        },
      },
    });

    if (!invoice) {
      invoice = await this.prisma.invoice.create({
        data: {
          accountId: creditCardId,
          month,
          year,
          closingDate,
          dueDate,
          status: InvoiceStatus.OPEN,
          totalAmount: 0,
        },
      });
    }

    return invoice.id;
  }

  /**
   * Calcula o mês e ano da fatura com base na data da transação e dia de fechamento
   */
  private calculateInvoiceMonthYear(transactionDate: Date, closingDay: number): { month: number; year: number } {
    const day = transactionDate.getDate();
    let month = transactionDate.getMonth() + 1; // getMonth() retorna 0-11
    let year = transactionDate.getFullYear();

    // Se a transação foi feita após o fechamento, vai para a próxima fatura
    if (day > closingDay) {
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    return { month, year };
  }

  async findByCard(userId: string, creditCardId: string) {
    // Validar que o cartão pertence ao usuário
    const account = await this.prisma.account.findFirst({
      where: {
        id: creditCardId,
        userId,
        type: AccountType.CREDIT_CARD,
      },
    });

    if (!account) {
      throw new NotFoundException('Cartão de crédito não encontrado');
    }

    return this.prisma.invoice.findMany({
      where: { accountId: creditCardId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id,
        account: {
          userId,
        },
      },
      include: {
        account: true,
        transactions: {
          include: {
            category: true,
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada');
    }

    // Recalcular o total
    const total = invoice.transactions.reduce((sum, t) => {
      return sum.add(new Decimal(t.amount.toString()));
    }, new Decimal(0));

    return {
      ...invoice,
      calculatedTotal: total,
    };
  }

  async markAsPaid(id: string, userId: string) {
    const invoice = await this.findOne(id, userId);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Fatura já está paga');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
      },
    });
  }

  async closeInvoice(id: string, userId: string) {
    const invoice = await this.findOne(id, userId);

    if (invoice.status === InvoiceStatus.CLOSED) {
      throw new BadRequestException('Fatura já está fechada');
    }

    // Calcular total real
    const total = invoice.transactions.reduce((sum, t) => {
      return sum.add(new Decimal(t.amount.toString()));
    }, new Decimal(0));

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.CLOSED,
        totalAmount: total,
      },
    });
  }

  async recalculateTotal(id: string, userId: string) {
    const invoice = await this.findOne(id, userId);

    const total = invoice.transactions.reduce((sum, t) => {
      return sum.add(new Decimal(t.amount.toString()));
    }, new Decimal(0));

    return this.prisma.invoice.update({
      where: { id },
      data: {
        totalAmount: total,
      },
    });
  }
}
