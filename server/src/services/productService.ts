import prisma from '../config/database';
import { ERROR_MESSAGES } from '../config/constants';
import { PaginationResult } from '../utils/pagination';

export interface ProductDTO {
    categoryId: number;
    name: string;
    slug: string;
    brand?: string;
    model?: string;
    description?: string;
}

export interface ProductItemDTO {
    productId: number;
    sku: string;
    price: number;
    qtyInStock: number;
    weightKg?: number;
    warrantyMonths?: number;
}

export interface ProductFilters {
    categoryId?: number;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
}

export const productService = {
    async getProducts(
        filters: ProductFilters,
        pagination: PaginationResult
    ) {
        const where: Record<string, unknown> = {
            isActive: true,
        };

        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters.brand) {
            where.brand = filters.brand;
        }

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { description: { contains: filters.search } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    items: {
                        take: 1,
                    },
                },
                skip: pagination.skip,
                take: pagination.take,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
        ]);

        return {
            products,
            total,
        };
    },

    async getProductById(id: number) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                images: true,
                items: true,
                reviews: {
                    where: { isApproved: true },
                },
                attributeValues: {
                    include: {
                        attribute: true,
                    },
                },
            },
        });

        if (!product) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        return product;
    },

    async getProductBySlug(slug: string) {
        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                images: true,
                items: true,
                reviews: {
                    where: { isApproved: true },
                },
                attributeValues: {
                    include: {
                        attribute: true,
                    },
                },
            },
        });

        if (!product) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        return product;
    },

    async createProduct(dto: ProductDTO) {
        // Check if category exists
        const category = await prisma.productCategory.findUnique({
            where: { id: dto.categoryId },
        });

        if (!category) {
            throw new Error('Danh mục sản phẩm không tồn tại');
        }

        // Check if slug already exists
        const existingProduct = await prisma.product.findUnique({
            where: { slug: dto.slug },
        });

        if (existingProduct) {
            throw new Error('Slug sản phẩm đã tồn tại');
        }

        const product = await prisma.product.create({
            data: {
                categoryId: dto.categoryId,
                name: dto.name,
                slug: dto.slug,
                brand: dto.brand,
                model: dto.model,
                description: dto.description,
                isActive: true,
            },
            include: {
                category: true,
            },
        });

        return product;
    },

    async updateProduct(id: number, dto: Partial<ProductDTO>) {
        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        // If category is being updated, check if it exists
        if (dto.categoryId) {
            const category = await prisma.productCategory.findUnique({
                where: { id: dto.categoryId },
            });

            if (!category) {
                throw new Error('Danh mục sản phẩm không tồn tại');
            }
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.slug && { slug: dto.slug }),
                ...(dto.brand && { brand: dto.brand }),
                ...(dto.model && { model: dto.model }),
                ...(dto.description && { description: dto.description }),
                ...(dto.categoryId && { categoryId: dto.categoryId }),
            },
            include: {
                category: true,
                images: true,
                items: true,
            },
        });

        return updatedProduct;
    },

    async deleteProduct(id: number) {
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        // Soft delete - set isActive to false
        await prisma.product.update({
            where: { id },
            data: { isActive: false },
        });
    },

    async getCategories() {
        const categories = await prisma.productCategory.findMany({
            include: {
                children: true,
                _count: {
                    select: { products: true },
                },
            },
            where: { parentId: null },
        });

        return categories;
    },

    async getProductImages(productId: number) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        const images = await prisma.productImage.findMany({
            where: { productId },
            orderBy: { displayOrder: 'asc' },
        });

        return images;
    },

    async getProductItems(productId: number) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }

        const items = await prisma.productItem.findMany({
            where: { productId, isActive: true },
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
        });

        return items;
    },

    async searchProducts(
        query: string,
        filters: ProductFilters,
        pagination: PaginationResult
    ) {
        const where: Record<string, unknown> = {
            isActive: true,
            OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { brand: { contains: query } },
            ],
        };

        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    items: {
                        take: 1,
                    },
                },
                skip: pagination.skip,
                take: pagination.take,
            }),
            prisma.product.count({ where }),
        ]);

        return {
            products,
            total,
        };
    },
};
