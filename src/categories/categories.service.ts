import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { Prisma } from '@prisma/client';

/**
 * Categories Service
 * Handles all category-related business logic with security focus
 * Security features:
 * - Input sanitization via DTOs
 * - Circular reference prevention
 * - Orphan prevention when deleting
 * - Transaction support for data consistency
 */
@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new category
   * Security: Validates parent exists, prevents circular references
   */
  async create(createCategoryDto: CreateCategoryDto) {
    const { parent_id, name, description, image_url, display_order, is_active } =
      createCategoryDto;

    // Security: Validate parent category exists if provided
    if (parent_id) {
      const parentCategory = await this.prisma.categories.findUnique({
        where: { id: parent_id },
      });

      if (!parentCategory) {
        throw new BadRequestException('Parent category not found');
      }

      // Security: Prevent creating category under inactive parent
      if (!parentCategory.is_active) {
        throw new BadRequestException(
          'Cannot create category under inactive parent',
        );
      }
    }

    // Generate slug from name
    const slug = this.generateSlug(name);

    // Check if slug exists, append number if needed
    let finalSlug = slug;
    let counter = 1;
    while (
      await this.prisma.categories.findUnique({ where: { slug: finalSlug } })
    ) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create category
    const category = await this.prisma.categories.create({
      data: {
        parent_id: parent_id || null,
        name,
        slug: finalSlug,
        description: description || null,
        image_url: image_url || null,
        display_order: display_order ?? 0,
        is_active: is_active ? 1 : 1, // Default active
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    this.logger.log(`Category created: ${category.name} (ID: ${category.id})`);

    return {
      message: 'Category created successfully',
      category,
    };
  }

  /**
   * Get all categories with filters and pagination
   * Security: Sanitized query parameters
   */
  async findAll(query: QueryCategoryDto) {
    const {
      search,
      parent_id,
      is_active,
      include_products_count,
      sort_by = 'display_order',
      sort_order = 'asc',
      page = 1,
      limit = 50,
    } = query;

    // Build where clause
    const where: Prisma.categoriesWhereInput = {
      AND: [
        // Active filter
        is_active !== undefined ? { is_active: is_active ? 1 : 0 } : {},

        // Parent filter (null for root categories)
        parent_id !== undefined ? { parent_id } : {},

        // Search filter
        search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {},
      ],
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build order by
    const orderBy: Prisma.categoriesOrderByWithRelationInput = {};
    if (sort_by === 'name') {
      orderBy.name = sort_order;
    } else if (sort_by === 'created_at') {
      orderBy.id = sort_order; // Using id as proxy for created_at
    } else {
      orderBy.display_order = sort_order;
    }

    // Execute queries in parallel
    const [categories, total] = await Promise.all([
      this.prisma.categories.findMany({
        where,
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: include_products_count
            ? {
                select: {
                  products: true,
                  other_categories: true,
                },
              }
            : undefined,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.categories.count({ where }),
    ]);

    // Format response
    const categoriesWithCounts = categories.map((category) => {
      const { _count, ...categoryData } = category;
      return {
        ...categoryData,
        products_count: _count?.products || 0,
        subcategories_count: _count?.other_categories || 0,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      categories: categoriesWithCounts,
      pagination: {
        total,
        page,
        limit,
        total_pages: totalPages,
        has_next_page: page < totalPages,
        has_prev_page: page > 1,
      },
    };
  }

  /**
   * Get category tree structure (hierarchical)
   * Security: Only returns active categories by default
   */
  async getCategoryTree(includeInactive = false) {
    const where: Prisma.categoriesWhereInput = includeInactive
      ? {}
      : { is_active: 1 };

    // Get all categories
    const allCategories = await this.prisma.categories.findMany({
      where,
      orderBy: { display_order: 'asc' },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // Build tree structure
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: Create map
    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, {
        ...cat,
        children: [],
        products_count: cat._count.products,
      });
    });

    // Second pass: Build tree
    allCategories.forEach((cat) => {
      const categoryNode = categoryMap.get(cat.id);
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return {
      categories: rootCategories,
    };
  }

  /**
   * Get single category by ID
   * Security: Returns 404 if not found
   */
  async findOne(id: number) {
    const category = await this.prisma.categories.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        other_categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            is_active: true,
          },
          orderBy: { display_order: 'asc' },
        },
        _count: {
          select: {
            products: true,
            other_categories: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      ...category,
      products_count: category._count.products,
      subcategories_count: category._count.other_categories,
    };
  }

  /**
   * Get category by slug (SEO-friendly)
   */
  async findBySlug(slug: string) {
    const category = await this.prisma.categories.findUnique({
      where: { slug },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        other_categories: {
          where: { is_active: 1 },
          select: {
            id: true,
            name: true,
            slug: true,
            image_url: true,
          },
          orderBy: { display_order: 'asc' },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      ...category,
      products_count: category._count.products,
    };
  }

  /**
   * Update a category
   * Security: Validates parent, prevents circular references
   */
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists
    const existingCategory = await this.prisma.categories.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    const { parent_id, name, description, image_url, display_order, is_active } =
      updateCategoryDto;

    // Security: Validate parent if being updated
    if (parent_id !== undefined) {
      // Prevent setting self as parent
      if (parent_id === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      // Check if parent exists
      if (parent_id !== null) {
        const parentCategory = await this.prisma.categories.findUnique({
          where: { id: parent_id },
        });

        if (!parentCategory) {
          throw new BadRequestException('Parent category not found');
        }

        // Security: Prevent circular reference (parent is child of this category)
        const isCircular = await this.checkCircularReference(id, parent_id);
        if (isCircular) {
          throw new BadRequestException(
            'Cannot set parent: would create circular reference',
          );
        }
      }
    }

    // If name is being updated, regenerate slug
    let slug: string | undefined;
    if (name && name !== existingCategory.name) {
      slug = this.generateSlug(name);

      // Check slug uniqueness
      let finalSlug = slug;
      let counter = 1;
      const existingSlug = await this.prisma.categories.findUnique({
        where: { slug: finalSlug },
      });

      if (existingSlug && existingSlug.id !== id) {
        while (
          await this.prisma.categories.findUnique({
            where: { slug: `${slug}-${counter}` },
          })
        ) {
          counter++;
        }
        finalSlug = `${slug}-${counter}`;
      }
      slug = finalSlug;
    }

    // Update category
    const category = await this.prisma.categories.update({
      where: { id },
      data: {
        parent_id: parent_id !== undefined ? parent_id : undefined,
        name: name || undefined,
        slug: slug || undefined,
        description: description !== undefined ? description : undefined,
        image_url: image_url !== undefined ? image_url : undefined,
        display_order: display_order !== undefined ? display_order : undefined,
        is_active: is_active !== undefined ? (is_active ? 1 : 0) : undefined,
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    this.logger.log(`Category updated: ${category.name} (ID: ${category.id})`);

    return {
      message: 'Category updated successfully',
      category,
    };
  }

  /**
   * Delete a category (soft delete by setting is_active to 0)
   * Security: Prevents deletion if has active children or products
   */
  async remove(id: number) {
    const category = await this.prisma.categories.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            other_categories: true,
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Security: Check if category has subcategories
    if (category._count.other_categories > 0) {
      throw new ConflictException(
        'Cannot delete category with subcategories. Delete or move subcategories first.',
      );
    }

    // Security: Check if category has products
    if (category._count.products > 0) {
      throw new ConflictException(
        `Cannot delete category with ${category._count.products} products. Move or delete products first.`,
      );
    }

    // Soft delete
    await this.prisma.categories.update({
      where: { id },
      data: { is_active: 0 },
    });

    this.logger.log(`Category deleted (soft): ${category.name} (ID: ${category.id})`);

    return {
      message: 'Category deleted successfully',
    };
  }

  /**
   * Reorder categories
   * Security: Admin only, validates IDs
   */
  async reorder(categoryOrders: { id: number; display_order: number }[]) {
    // Validate all category IDs exist
    const categoryIds = categoryOrders.map((co) => co.id);
    const categories = await this.prisma.categories.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });

    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('One or more category IDs are invalid');
    }

    // Update in transaction
    await this.prisma.$transaction(
      categoryOrders.map((co) =>
        this.prisma.categories.update({
          where: { id: co.id },
          data: { display_order: co.display_order },
        }),
      ),
    );

    this.logger.log(`Reordered ${categoryOrders.length} categories`);

    return {
      message: 'Categories reordered successfully',
    };
  }

  /**
   * Generate SEO-friendly slug from name
   * Security: Sanitizes input, removes special characters
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-'); // Remove duplicate -
  }

  /**
   * Check for circular reference in category hierarchy
   * Security: Prevents infinite loops
   */
  private async checkCircularReference(
    categoryId: number,
    potentialParentId: number,
  ): Promise<boolean> {
    let currentId = potentialParentId;
    const visited = new Set<number>();

    while (currentId !== null) {
      // Detect circular reference
      if (currentId === categoryId) {
        return true;
      }

      // Prevent infinite loop
      if (visited.has(currentId)) {
        return false;
      }
      visited.add(currentId);

      // Get parent
      const category = await this.prisma.categories.findUnique({
        where: { id: currentId },
        select: { parent_id: true },
      });

      if (!category || category.parent_id === null) {
        break;
      }

      currentId = category.parent_id;
    }

    return false;
  }
}
