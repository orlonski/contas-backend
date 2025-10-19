import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty({ example: 'Conta Corrente Nubank' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1000.0 })
  @IsNumber()
  @Type(() => Number)
  initialBalance: number;

  @ApiProperty({ enum: AccountType, example: AccountType.CHECKING })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Campos específicos para Cartão de Crédito
  @ApiPropertyOptional({ example: 10, description: 'Dia de vencimento da fatura (1-31)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  dueDay?: number;

  @ApiPropertyOptional({ example: 5, description: 'Dia de fechamento da fatura (1-31)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  closingDay?: number;

  @ApiPropertyOptional({ example: 5000.0, description: 'Limite do cartão de crédito' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  creditLimit?: number;

  @ApiPropertyOptional({ example: 'Nubank', description: 'Banco emissor do cartão' })
  @IsOptional()
  @IsString()
  bank?: string;
}
