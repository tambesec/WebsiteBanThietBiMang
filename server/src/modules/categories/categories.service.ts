import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all categories with hierarchy
   * Returns tree structure with children
   */
  async findAll() {
    const categories = await this.prisma.productCategory.findMany({
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      parent: cat.parent,
      children: cat.children,
      productCount: cat._count.products,
    }));
  }

  /**
   * Get category tree (only root categories with children)
   */
  async getCategoryTree() {
    const rootCategories = await this.prisma.productCategory.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
            _count: {
              select: { products: true },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return rootCategories;
  }

  /**
   * Get category by ID with products
   */
  async findOne(id: number) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true },
        },
        products: {
          where: { isActive: true },
          take: 20,
          include: {
            items: {
              where: { isActive: true },
              take: 1,
              orderBy: { price: 'asc' },
            },
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Create category (admin only)
   */
  async create(createCategoryDto: CreateCategoryDto) {
    // Check slug uniqueness
    const existing = await this.prisma.productCategory.findUnique({
      where: { slug: createCategoryDto.slug },
    });

    if (existing) {
      throw new ConflictException(`Category with slug '${createCategoryDto.slug}' already exists`);
    }

    // Verify parent exists if provided
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.productCategory.findUnique({
        where: { id: createCategoryDto.parentId },
      });

      if (!parent) {
        throw new BadRequestException(`Parent category with ID ${createCategoryDto.parentId} not found`);
      }
    }

    return this.prisma.productCategory.create({
      data: createCategoryDto,
      include: {
        parent: true,
      },
    });
  }

  /**
   * Update category (admin only)
   */
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Check category exists
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check slug uniqueness if updating
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.prisma.productCategory.findUnique({
        where: { slug: updateCategoryDto.slug },
      });

      if (existing) {
        throw new ConflictException(`Category with slug '${updateCategoryDto.slug}' already exists`);
      }
    }

    // Verify parent exists if updating
    if (updateCategoryDto.parentId) {
      // Prevent self-reference
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parent = await this.prisma.productCategory.findUnique({
        where: { id: updateCategoryDto.parentId },
      });

      if (!parent) {
        throw new BadRequestException(`Parent category with ID ${updateCategoryDto.parentId} not found`);
      }
    }

    return this.prisma.productCategory.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        parent: true,
      },
    });
  }

  /**
   * Delete category (admin only)
   * Only allows deletion if no products assigned
   */
  async remove(id: number) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Prevent deletion if has products or children
    if (category._count.products > 0) {
      throw new BadRequestException('Cannot delete category with products. Please reassign products first.');
    }

    if (category._count.children > 0) {
      throw new BadRequestException('Cannot delete category with sub-categories. Please delete or reassign them first.');
    }

    await this.prisma.productCategory.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }
}
