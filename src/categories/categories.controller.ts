import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria' })
  create(@CurrentUser() user: any, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(user.userId, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias' })
  findAll(@CurrentUser() user: any) {
    return this.categoriesService.findAll(user.userId);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Listar categorias em árvore hierárquica' })
  findTree(@CurrentUser() user: any) {
    return this.categoriesService.findTree(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.categoriesService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, user.userId, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover categoria' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.categoriesService.remove(id, user.userId);
  }
}
