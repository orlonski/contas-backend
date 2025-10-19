import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CategoryType } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Alimentação' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'food', description: 'Slug do ícone' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.EXPENSE })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID da categoria pai (para subcategorias)',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
