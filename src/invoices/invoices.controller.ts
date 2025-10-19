import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('card/:creditCardId')
  @ApiOperation({ summary: 'Listar todas as faturas de um cartão' })
  findByCard(@Param('creditCardId') creditCardId: string, @CurrentUser() user: any) {
    return this.invoicesService.findByCard(user.userId, creditCardId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar fatura com todas as transações' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.findOne(id, user.userId);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Marcar fatura como paga' })
  markAsPaid(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.markAsPaid(id, user.userId);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Fechar fatura' })
  closeInvoice(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.closeInvoice(id, user.userId);
  }

  @Patch(':id/recalculate')
  @ApiOperation({ summary: 'Recalcular valor total da fatura' })
  recalculateTotal(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.recalculateTotal(id, user.userId);
  }
}
