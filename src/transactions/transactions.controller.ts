import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TransactionType } from '@prisma/client';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova transação (com suporte a parcelamento e recorrência)' })
  create(@CurrentUser() user: any, @Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(user.userId, createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar transações com filtros opcionais' })
  @ApiQuery({ name: 'accountId', required: false })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  findAll(
    @CurrentUser() user: any,
    @Query('accountId') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: TransactionType,
  ) {
    return this.transactionsService.findAll(
      user.userId,
      accountId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      type,
    );
  }

  @Get('invoice/:invoiceId')
  @ApiOperation({ summary: 'Listar transações de uma fatura específica' })
  findByInvoice(@Param('invoiceId') invoiceId: string, @CurrentUser() user: any) {
    return this.transactionsService.findByInvoice(invoiceId, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar transação por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.transactionsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar transação individual' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, user.userId, updateTransactionDto);
  }

  @Patch('series/:seriesId')
  @ApiOperation({ summary: 'Atualizar todas as transações de uma série' })
  updateSeries(
    @Param('seriesId') seriesId: string,
    @CurrentUser() user: any,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.updateSeries(seriesId, user.userId, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar transação individual' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.transactionsService.remove(id, user.userId);
  }

  @Delete('series/:seriesId')
  @ApiOperation({ summary: 'Deletar todas as transações de uma série' })
  removeSeries(@Param('seriesId') seriesId: string, @CurrentUser() user: any) {
    return this.transactionsService.removeSeries(seriesId, user.userId);
  }
}
