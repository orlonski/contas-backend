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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova conta' })
  create(@CurrentUser() user: any, @Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(user.userId, createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as contas' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  findAll(@CurrentUser() user: any, @Query('activeOnly') activeOnly?: string) {
    return this.accountsService.findAll(user.userId, activeOnly === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar conta por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.accountsService.findOne(id, user.userId);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Obter saldo atual da conta' })
  getCurrentBalance(@Param('id') id: string, @CurrentUser() user: any) {
    return this.accountsService.getCurrentBalance(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar conta' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(id, user.userId, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover conta' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.accountsService.remove(id, user.userId);
  }
}
