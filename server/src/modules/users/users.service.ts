import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto, CreateAddressDto, CreateReviewDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user profile
   * Security: User can only access their own profile
   */
  async getProfile(userId: number) {
    const user = await this.prisma.siteUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      roles: user.roles.map((ur) => ur.role.name),
    };
  }

  /**
   * Update user profile
   * Security: Validates email/username uniqueness, user can only update their own profile
   */
  async updateProfile(userId: number, updateDto: UpdateProfileDto) {
    // Check if email or username already exists (if updating)
    if (updateDto.email || updateDto.username) {
      const existing = await this.prisma.siteUser.findFirst({
        where: {
          OR: [
            updateDto.email ? { email: updateDto.email } : {},
            updateDto.username ? { username: updateDto.username } : {},
          ],
          NOT: { id: userId },
        },
      });

      if (existing) {
        if (existing.email === updateDto.email) {
          throw new ConflictException('Email đã được sử dụng');
        }
        if (existing.username === updateDto.username) {
          throw new ConflictException('Tên đăng nhập đã được sử dụng');
        }
      }
    }

    const user = await this.prisma.siteUser.update({
      where: { id: userId },
      data: updateDto,
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Get user addresses
   * Security: User can only access their own addresses
   */
  async getAddresses(userId: number) {
    const userAddresses = await this.prisma.userAddress.findMany({
      where: { userId },
      include: {
        address: true,
      },
      orderBy: { isDefault: 'desc' },
    });

    return userAddresses.map((ua) => ({
      ...ua.address,
      isDefault: ua.isDefault,
      addressType: ua.addressType,
    }));
  }

  /**
   * Create new address
   * Security: User can only create addresses for themselves
   */
  async createAddress(userId: number, createDto: CreateAddressDto) {
    // If this is set as default, remove default from other addresses
    if (createDto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create Address first
    const address = await this.prisma.address.create({
      data: {
        recipientName: createDto.recipientName,
        phone: createDto.phone,
        streetAddress: createDto.streetAddress,
        ward: createDto.ward,
        district: createDto.district,
        city: createDto.city,
        region: createDto.region,
        postalCode: createDto.postalCode,
        country: createDto.country || 'Việt Nam',
      },
    });

    // Link to user
    await this.prisma.userAddress.create({
      data: {
        userId,
        addressId: address.id,
        addressType: createDto.addressType || 'shipping',
        isDefault: createDto.isDefault || false,
      },
    });

    return {
      id: address.id,
      recipientName: address.recipientName,
      phone: address.phone,
      streetAddress: address.streetAddress,
      ward: address.ward,
      district: address.district,
      city: address.city,
      region: address.region,
      postalCode: address.postalCode,
      country: address.country,
      addressType: createDto.addressType || 'shipping',
      isDefault: createDto.isDefault || false,
    };
  }

  /**
   * Update address
   * Security: User can only update their own addresses
   */
  async updateAddress(userId: number, addressId: number, updateDto: CreateAddressDto) {
    // Verify address belongs to user
    const userAddress = await this.prisma.userAddress.findFirst({
      where: { userId, addressId },
    });

    if (!userAddress) {
      throw new NotFoundException('Address not found');
    }

    // If setting as default, remove default from other addresses
    if (updateDto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true, NOT: { addressId } },
        data: { isDefault: false },
      });
    }

    // Update address
    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        recipientName: updateDto.recipientName,
        phone: updateDto.phone,
        streetAddress: updateDto.streetAddress,
        ward: updateDto.ward,
        district: updateDto.district,
        city: updateDto.city,
        region: updateDto.region,
        postalCode: updateDto.postalCode,
        country: updateDto.country,
      },
    });

    // Update addressType and isDefault if needed
    await this.prisma.userAddress.update({
      where: { userId_addressId: { userId, addressId } },
      data: {
        ...(updateDto.addressType && { addressType: updateDto.addressType }),
        ...(updateDto.isDefault !== undefined && { isDefault: updateDto.isDefault }),
      },
    });

    return {
      id: updated.id,
      recipientName: updated.recipientName,
      phone: updated.phone,
      streetAddress: updated.streetAddress,
      ward: updated.ward,
      district: updated.district,
      city: updated.city,
      region: updated.region,
      postalCode: updated.postalCode,
      country: updated.country,
      addressType: updateDto.addressType || userAddress.addressType,
      isDefault: updateDto.isDefault ?? userAddress.isDefault,
    };
  }

  /**
   * Delete address
   * Security: User can only delete their own addresses
   */
  async deleteAddress(userId: number, addressId: number) {
    const userAddress = await this.prisma.userAddress.findFirst({
      where: { userId, addressId },
    });

    if (!userAddress) {
      throw new NotFoundException('Address not found');
    }

    // Delete the link first
    await this.prisma.userAddress.delete({
      where: { userId_addressId: { userId, addressId } },
    });

    // Optionally delete the address if no other users use it
    const othersUsingAddress = await this.prisma.userAddress.count({
      where: { addressId },
    });

    if (othersUsingAddress === 0) {
      await this.prisma.address.delete({
        where: { id: addressId },
      });
    }

    return { message: 'Address deleted successfully' };
  }

  /**
   * Get user orders
   * Security: User can only access their own orders
   */
  async getOrders(userId: number) {
    return this.prisma.shopOrder.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            productItem: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        shippingAddress: true,
        shippingMethod: true,
        paymentMethod: true,
        status: true,
      },
      orderBy: { orderedAt: 'desc' },
    });
  }

  /**
   * Get order details
   * Security: User can only access their own orders
   */
  async getOrderDetails(userId: number, orderId: number) {
    const order = await this.prisma.shopOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            productItem: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    brand: true,
                  },
                },
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        shippingMethod: true,
        paymentMethod: true,
        status: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('You can only access your own orders');
    }

    return order;
  }

  /**
   * Create product review
   * Security: User can only review products they purchased, one review per product
   */
  async createReview(userId: number, createDto: CreateReviewDto) {
    const { productId, rating, comment } = createDto;

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await this.prisma.productReview.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingReview) {
      throw new ConflictException('Bạn đã đánh giá sản phẩm này rồi');
    }

    // Verify user purchased this product
    const hasPurchased = await this.prisma.shopOrder.findFirst({
      where: {
        userId,
        items: {
          some: {
            productItem: {
              productId,
            },
          },
        },
        status: {
          name: {
            in: ['delivered', 'completed'],
          },
        },
      },
    });

    if (!hasPurchased) {
      throw new BadRequestException('Bạn chỉ có thể đánh giá sản phẩm đã mua');
    }

    return this.prisma.productReview.create({
      data: {
        userId,
        productId,
        rating,
        comment,
        isApproved: false, // Reviews need admin approval
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Get user reviews
   * Security: User can only access their own reviews
   */
  async getReviews(userId: number) {
    return this.prisma.productReview.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
