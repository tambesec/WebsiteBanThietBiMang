import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all unique brands from products
   * Returns aggregated list of brands with product count
   */
  async findAll() {
    // Get distinct brands from products
    const brands = await this.prisma.product.groupBy({
      by: ['brand'],
      where: {
        brand: {
          not: null,
        },
        isActive: true,
      },
      _count: {
        brand: true,
      },
      orderBy: {
        brand: 'asc',
      },
    });

    return brands.map((item, index) => ({
      id: index + 1,
      name: item.brand,
      productCount: item._count.brand,
    }));
  }

  /**
   * Get brand by name with products
   */
  async findOne(brandName: string) {
    const products = await this.prisma.product.findMany({
      where: {
        brand: brandName,
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
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
    });

    if (products.length === 0) {
      throw new NotFoundException(`Brand '${brandName}' not found`);
    }

    return {
      name: brandName,
      productCount: products.length,
      products,
    };
  }
}
