import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateProductItemDto,
  ProductQueryDto,
} from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get paginated products with filters
   * Security: SQL injection prevention via Prisma
   */
  async findAll(query: ProductQueryDto) {
    const { page, limit, search, categoryId, brand, isActive, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Build where clause with sanitized inputs
    const where: Prisma.ProductWhereInput = {
      ...(isActive !== undefined && { isActive }),
      ...(categoryId && { categoryId }),
      ...(brand && {
        brand: {
          contains: brand,
        },
      }),
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            description: {
              contains: search,
            },
          },
        ],
      }),
    };

    // Execute query with proper ordering
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.buildOrderBy(sortBy, sortOrder),
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          items: {
            where: { isActive: true },
            take: 1,
            orderBy: { price: 'asc' },
            select: {
              id: true,
              sku: true,
              price: true,
              qtyInStock: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              imageUrl: true,
            },
          },
          _count: {
            select: {
              reviews: { where: { isApproved: true } },
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get product by ID with full details
   * Security: Validates ID type, returns 404 if not found
   */
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true, parentId: true },
        },
        items: {
          where: { isActive: true },
          include: {
            configurations: {
              include: {
                variationOption: {
                  include: {
                    variation: true,
                  },
                },
              },
            },
          },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        attributeValues: {
          include: {
            attribute: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
        _count: {
          select: {
            reviews: { where: { isApproved: true } },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Calculate average rating
    const avgRating = await this.calculateAverageRating(id);

    return {
      ...product,
      averageRating: avgRating,
    };
  }

  /**
   * Get product by slug with full details
   * Security: Returns 404 if not found
   */
  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true, parentId: true },
        },
        items: {
          where: { isActive: true },
          include: {
            configurations: {
              include: {
                variationOption: {
                  include: {
                    variation: true,
                  },
                },
              },
            },
          },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        attributeValues: {
          include: {
            attribute: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
        _count: {
          select: {
            reviews: { where: { isApproved: true } },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug '${slug}' not found`);
    }

    // Calculate average rating
    const avgRating = await this.calculateAverageRating(product.id);

    return {
      ...product,
      averageRating: avgRating,
    };
  }

  /**
   * Create new product
   * Security: Admin only (enforced by guard), input validation via DTOs
   */
  async create(createProductDto: CreateProductDto) {
    // Check if slug already exists
    const existing = await this.prisma.product.findUnique({
      where: { slug: createProductDto.slug },
    });

    if (existing) {
      throw new ConflictException(`Product with slug '${createProductDto.slug}' already exists`);
    }

    // Verify category exists
    const category = await this.prisma.productCategory.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException(`Category with ID ${createProductDto.categoryId} not found`);
    }

    return this.prisma.product.create({
      data: createProductDto,
      include: {
        category: true,
      },
    });
  }

  /**
   * Update product
   * Security: Admin only, validates product exists
   */
  async update(id: number, updateProductDto: UpdateProductDto) {
    // Check product exists
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check slug uniqueness if updating slug
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existing = await this.prisma.product.findUnique({
        where: { slug: updateProductDto.slug },
      });
      if (existing) {
        throw new ConflictException(`Product with slug '${updateProductDto.slug}' already exists`);
      }
    }

    // Verify category if updating
    if (updateProductDto.categoryId) {
      const category = await this.prisma.productCategory.findUnique({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(
          `Category with ID ${updateProductDto.categoryId} not found`,
        );
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
      },
    });
  }

  /**
   * Soft delete product (set isActive to false)
   * Security: Admin only, safer than hard delete
   */
  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Create product item (SKU)
   * Security: Admin only, validates product and SKU uniqueness
   */
  async createProductItem(createItemDto: CreateProductItemDto) {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: createItemDto.productId },
    });
    if (!product) {
      throw new BadRequestException(`Product with ID ${createItemDto.productId} not found`);
    }

    // Check SKU uniqueness
    const existing = await this.prisma.productItem.findUnique({
      where: { sku: createItemDto.sku },
    });
    if (existing) {
      throw new ConflictException(`SKU '${createItemDto.sku}' already exists`);
    }

    return this.prisma.productItem.create({
      data: createItemDto,
      include: {
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  /**
   * Calculate average rating for product
   * Private helper method
   */
  private async calculateAverageRating(productId: number): Promise<number> {
    const result = await this.prisma.productReview.aggregate({
      where: {
        productId,
        isApproved: true,
      },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating || 0;
  }

  /**
   * Build orderBy clause
   * Security: Whitelist allowed sort fields
   */
  private buildOrderBy(sortBy: string, sortOrder: 'asc' | 'desc') {
    const allowedSortFields = ['createdAt', 'name', 'updatedAt'];

    if (!allowedSortFields.includes(sortBy)) {
      return { createdAt: sortOrder };
    }

    return { [sortBy]: sortOrder };
  }
}
