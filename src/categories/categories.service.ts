import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    const { parentId, ...rest } = createCategoryDto;

    // Validar se a categoria pai existe e pertence ao usuário
    if (parentId) {
      const parent = await this.prisma.category.findFirst({
        where: { id: parentId, userId },
      });

      if (!parent) {
        throw new NotFoundException('Categoria pai não encontrada');
      }
    }

    return this.prisma.category.create({
      data: {
        userId,
        parentId,
        ...rest,
      },
      include: {
        parent: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      include: {
        parent: true,
        children: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findTree(userId: string) {
    // Buscar todas as categorias do usuário
    const categories = await this.prisma.category.findMany({
      where: { userId },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Filtrar apenas categorias raiz (sem pai)
    const tree = categories.filter((cat) => !cat.parentId);

    return tree;
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(id: string, userId: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id, userId);

    const { parentId, ...rest } = updateCategoryDto;

    // Validar se a categoria pai existe e pertence ao usuário
    if (parentId) {
      // Não pode ser pai de si mesmo
      if (parentId === id) {
        throw new BadRequestException('Uma categoria não pode ser pai de si mesma');
      }

      const parent = await this.prisma.category.findFirst({
        where: { id: parentId, userId },
      });

      if (!parent) {
        throw new NotFoundException('Categoria pai não encontrada');
      }

      // Verificar se não cria ciclo (categoria pai não pode ser filha desta categoria)
      const isDescendant = await this.isDescendant(id, parentId);
      if (isDescendant) {
        throw new BadRequestException('Não é possível criar uma hierarquia circular');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        parentId,
        ...rest,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    // Verificar se tem filhos
    const hasChildren = await this.prisma.category.count({
      where: { parentId: id },
    });

    if (hasChildren > 0) {
      throw new BadRequestException(
        'Não é possível remover uma categoria que possui subcategorias',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Categoria removida com sucesso' };
  }

  // Método auxiliar para verificar se uma categoria é descendente de outra
  private async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    const descendant = await this.prisma.category.findUnique({
      where: { id: descendantId },
      include: { parent: true },
    });

    if (!descendant || !descendant.parentId) {
      return false;
    }

    if (descendant.parentId === ancestorId) {
      return true;
    }

    return this.isDescendant(ancestorId, descendant.parentId);
  }
}
