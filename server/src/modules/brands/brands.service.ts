import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all brands
   */
  async findAll() {
    const brands = await this.prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      description: brand.description,
      website: brand.website,
      productCount: brand._count.products,
    }));
  }

  /**
   * Get brand by ID
   */
  async findOne(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return {
      ...brand,
      productCount: brand._count.products,
    };
  }

  /**
   * Get brand by slug
   */
  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          take: 20,
          include: {
            category: {
              select: { id: true, name: true, slug: true },
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

    if (!brand) {
      throw new NotFoundException(`Brand '${slug}' not found`);
    }

    return {
      ...brand,
      productCount: brand._count.products,
    };
  }

  /**
   * Create new brand (Admin)
   */
  async create(dto: CreateBrandDto) {
    // Generate slug from name
    const slug = dto.slug || this.generateSlug(dto.name);

    // Check if brand with same name or slug exists
    const existing = await this.prisma.brand.findFirst({
      where: {
        OR: [{ name: dto.name }, { slug }],
      },
    });

    if (existing) {
      throw new NotFoundException('Brand with this name or slug already exists');
    }

    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        logo: dto.logo,
        description: dto.description,
        website: dto.website,
        isActive: dto.isActive ?? true,
      },
    });
  }

  /**
   * Update brand (Admin)
   */
  async update(id: number, dto: UpdateBrandDto) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    const slug = dto.slug || (dto.name ? this.generateSlug(dto.name) : undefined);

    return this.prisma.brand.update({
      where: { id },
      data: {
        name: dto.name,
        slug,
        logo: dto.logo,
        description: dto.description,
        website: dto.website,
        isActive: dto.isActive,
      },
    });
  }

  /**
   * Delete brand (Admin)
   */
  async remove(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    if (brand._count.products > 0) {
      throw new NotFoundException(
        `Cannot delete brand with ${brand._count.products} associated products`,
      );
    }

    return this.prisma.brand.delete({
      where: { id },
    });
  }

  /**
   * Toggle brand active status (Admin)
   */
  async toggleActive(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        isActive: !brand.isActive,
      },
    });
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
