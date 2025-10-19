import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
  IsOptional,
  IsUUID,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, RecurrenceType, IntervalUnit } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  accountId: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 150.5 })
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ example: 'Compra no supermercado' })
  @IsString()
  description: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type: TransactionType;

  // Campos de Parcelamento/Recorrência
  @ApiPropertyOptional({ enum: RecurrenceType, default: RecurrenceType.SIMPLE })
  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrenceType?: RecurrenceType;

  @ApiPropertyOptional({ example: 10, description: 'Número total de parcelas' })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Type(() => Number)
  totalInstallments?: number;

  @ApiPropertyOptional({ example: 1000.0, description: 'Valor total (para parcelamento)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalAmount?: number;

  // Recorrência Avançada
  @ApiPropertyOptional({ example: 1, description: 'Intervalo (ex: a cada 2 meses)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  intervalNumber?: number;

  @ApiPropertyOptional({ enum: IntervalUnit, example: IntervalUnit.MONTH })
  @IsOptional()
  @IsEnum(IntervalUnit)
  intervalUnit?: IntervalUnit;

  @ApiPropertyOptional({ example: false, description: 'Recorrência indefinida?' })
  @IsOptional()
  @IsBoolean()
  isIndefinite?: boolean;

  @ApiPropertyOptional({ example: 12, description: 'Número de ocorrências' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  occurrences?: number;

  // Transferência
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID da conta de destino (para transferências)',
  })
  @IsOptional()
  @IsUUID()
  transferToId?: string;

  // Cartão de Crédito
  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID do cartão de crédito',
  })
  @IsOptional()
  @IsUUID()
  creditCardId?: string;
}
