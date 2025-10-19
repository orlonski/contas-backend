import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Obter resumo geral do dashboard' })
  getSummary(@CurrentUser() user: any) {
    return this.dashboardService.getSummary(user.userId);
  }

  @Get('consolidated-balance')
  @ApiOperation({ summary: 'Obter saldo consolidado de todas as contas' })
  getConsolidatedBalance(@CurrentUser() user: any) {
    return this.dashboardService.getConsolidatedBalance(user.userId);
  }

  @Get('period-result')
  @ApiOperation({ summary: 'Obter resultado do período (receitas vs despesas)' })
  @ApiQuery({
    name: 'filter',
    enum: ['currentMonth', 'remainingMonth', 'fullMonth'],
    required: false,
  })
  getPeriodResult(
    @CurrentUser() user: any,
    @Query('filter') filter: 'currentMonth' | 'remainingMonth' | 'fullMonth' = 'currentMonth',
  ) {
    return this.dashboardService.getPeriodResult(user.userId, filter);
  }

  @Get('expenses-by-category')
  @ApiOperation({ summary: 'Obter despesas agrupadas por categoria' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  getExpensesByCategory(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getExpensesByCategory(
      user.userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Obter fluxo de caixa (histórico de entradas e saídas)' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: 'Número de meses (padrão: 12)' })
  getCashFlow(@CurrentUser() user: any, @Query('months') months?: string) {
    const monthsNumber = months ? parseInt(months, 10) : 12;
    return this.dashboardService.getCashFlow(user.userId, monthsNumber);
  }
}
