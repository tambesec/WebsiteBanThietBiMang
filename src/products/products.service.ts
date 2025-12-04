import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Prisma } from '@prisma/client';

/**
 * Products Service
 * Handles all product-related business logic
 */
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new product
   */
  async create(createProductDto: CreateProductDto) {
    // Check if category exists
    const category = await this.prisma.categories.findUnique({
      where: { id: createProductDto.category_id },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // Check if SKU already exists
    const existingSku = await this.prisma.products.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existingSku) {
      throw new ConflictException('SKU already exists');
    }

    // Generate slug from product name
    const slug = this.generateSlug(createProductDto.name);

    // Check if slug exists, if yes, append number
    let finalSlug = slug;
    let counter = 1;
    while (await this.prisma.products.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create product
    const product = await this.prisma.products.create({
      data: {
        ...createProductDto,
        slug: finalSlug,
        is_active: 1,
        is_featured: 0,
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

    this.logger.log(`Product created: ${product.name} (ID: ${product.id})`);

    return {
      message: 'Product created successfully',
      product,
    };
  }

  /**
   * Find all products with filters, search, and pagination
   */
  async findAll(query: QueryProductDto) {
    const {
      search,
      category_id,
      brand,
      min_price,
      max_price,
      is_featured,
      is_active = true,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      limit = 20,
    } = query;

    // Build where clause
    const where: Prisma.productsWhereInput = {
      AND: [
        // Active filter
        is_active !== undefined ? { is_active: is_active ? 1 : 0 } : {},

        // Featured filter
        is_featured !== undefined ? { is_featured: is_featured ? 1 : 0 } : {},

        // Category filter
        category_id ? { category_id } : {},

        // Brand filter
        brand ? { brand } : {},

        // Price range filter
        min_price !== undefined || max_price !== undefined
          ? {
              price: {
                ...(min_price !== undefined && { gte: min_price }),
                ...(max_price !== undefined && { lte: max_price }),
              },
            }
          : {},

        // Search filter (name, brand, model, description)
        search
          ? {
              OR: [
                { name: { contains: search } },
                { brand: { contains: search } },
                { model: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {},
      ],
    };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build order by
    const orderBy: Prisma.productsOrderByWithRelationInput = {};
    if (sort_by === 'price') {
      orderBy.price = sort_order;
    } else if (sort_by === 'name') {
      orderBy.name = sort_order;
    } else if (sort_by === 'stock_quantity') {
      orderBy.stock_quantity = sort_order;
    } else {
      orderBy.created_at = sort_order;
    }

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      this.prisma.products.findMany({
        where,
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          product_reviews: {
            where: { is_approved: 1 },
            select: {
              rating: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.products.count({ where }),
    ]);

    // Calculate average rating for each product (no extra queries)
    const productsWithRating = products.map((product) => {
      const reviews = product.product_reviews;
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      const { product_reviews, ...productData } = product;

      return {
        ...productData,
        average_rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        reviews_count: reviews.length,
      };
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      products: productsWithRating,
      pagination: {
        total,
        page,
        limit,
        total_pages: totalPages,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
      },
    };
  }

  /**
   * Find one product by ID
   */
  async findOne(id: number) {
    const product = await this.prisma.products.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent_id: true,
          },
        },
        product_images: {
          orderBy: { display_order: 'asc' },
        },
        product_reviews: {
          where: { is_approved: 1 },
          include: {
            users: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Calculate average rating from loaded reviews (no extra query)
    const reviews = product.product_reviews;
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Get related products (same category)
    const relatedProducts = await this.prisma.products.findMany({
      where: {
        category_id: product.category_id,
        id: { not: id },
        is_active: 1,
      },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compare_at_price: true,
        primary_image: true,
        brand: true,
      },
    });

    return {
      ...product,
      average_rating: Math.round(avgRating * 10) / 10,
      reviews_count: reviews.length,
      related_products: relatedProducts,
    };
  }

  /**
   * Find product by slug (SEO-friendly)
   */
  async findBySlug(slug: string) {
    const product = await this.prisma.products.findUnique({
      where: { slug },
      include: {
        categories: true,
        product_images: {
          orderBy: { display_order: 'asc' },
        },
        product_reviews: {
          where: { is_approved: 1 },
          include: {
            users: {
              select: {
                id: true,
                full_name: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Calculate average rating from loaded reviews (no extra query)
    const reviews = product.product_reviews;
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      ...product,
      average_rating: Math.round(avgRating * 10) / 10,
      reviews_count: reviews.length,
    };
  }

  /**
   * Update a product
   */
  async update(id: number, updateProductDto: UpdateProductDto) {
    // Check if product exists
    const existingProduct = await this.prisma.products.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    // Run validation queries in parallel if needed
    const validationPromises: Promise<any>[] = [];

    // If category is being updated, check if it exists
    if (updateProductDto.category_id) {
      validationPromises.push(
        this.prisma.categories.findUnique({
          where: { id: updateProductDto.category_id },
        }).then(category => {
          if (!category) {
            throw new BadRequestException('Category not found');
          }
          return category;
        })
      );
    }

    // If SKU is being updated, check for conflicts
    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      validationPromises.push(
        this.prisma.products.findUnique({
          where: { sku: updateProductDto.sku },
        }).then(existingSku => {
          if (existingSku) {
            throw new ConflictException('SKU already exists');
          }
          return null;
        })
      );
    }

    // Wait for all validations to complete
    if (validationPromises.length > 0) {
      await Promise.all(validationPromises);
    }

    // If name is being updated, regenerate slug
    let slug: string | undefined;
    if (updateProductDto.name && updateProductDto.name !== existingProduct.name) {
      slug = this.generateSlug(updateProductDto.name);
      
      // Check slug uniqueness
      let finalSlug = slug;
      let counter = 1;
      const existingSlug = await this.prisma.products.findUnique({
        where: { slug: finalSlug },
      });
      
      if (existingSlug && existingSlug.id !== id) {
        while (
          await this.prisma.products.findUnique({
            where: { slug: `${slug}-${counter}` },
          })
        ) {
          counter++;
        }
        finalSlug = `${slug}-${counter}`;
      }
      slug = finalSlug;
    }

    // Update product
    const product = await this.prisma.products.update({
      where: { id },
      data: {
        ...updateProductDto,
        ...(slug && { slug }),
        updated_at: new Date(),
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

    this.logger.log(`Product updated: ${product.name} (ID: ${product.id})`);

    return {
      message: 'Product updated successfully',
      product,
    };
  }

  /**
   * Delete a product (soft delete by setting is_active to 0)
   */
  async remove(id: number) {
    // Check if product exists
    const product = await this.prisma.products.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Soft delete
    await this.prisma.products.update({
      where: { id },
      data: {
        is_active: 0,
        updated_at: new Date(),
      },
    });

    this.logger.log(`Product deleted (soft): ${product.name} (ID: ${product.id})`);

    return {
      message: 'Product deleted successfully',
    };
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: number) {
    const product = await this.prisma.products.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updated = await this.prisma.products.update({
      where: { id },
      data: {
        is_featured: product.is_featured === 1 ? 0 : 1,
        updated_at: new Date(),
      },
    });

    return {
      message: `Product ${updated.is_featured === 1 ? 'featured' : 'unfeatured'} successfully`,
      is_featured: updated.is_featured === 1,
    };
  }

  /**
   * Update stock quantity
   */
  async updateStock(id: number, quantity: number) {
    const product = await this.prisma.products.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (quantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    const updated = await this.prisma.products.update({
      where: { id },
      data: {
        stock_quantity: quantity,
        updated_at: new Date(),
      },
    });

    return {
      message: 'Stock updated successfully',
      stock_quantity: updated.stock_quantity,
    };
  }

  /**
   * Generate SEO-friendly slug from name
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
}
