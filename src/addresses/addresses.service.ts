import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create new address
   * Security: Only authenticated users can create addresses for themselves
   */
  async create(userId: number, dto: CreateAddressDto) {
    // Security: Check if user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Security: Validate phone format (additional server-side check)
    const phoneRegex = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
    if (!phoneRegex.test(dto.phone)) {
      throw new BadRequestException('Invalid phone number format');
    }

    // Check if this is the first address for user
    const existingAddressCount = await this.prisma.addresses.count({
      where: { user_id: userId },
    });

    const isFirstAddress = existingAddressCount === 0;

    // If first address, auto set as default
    // If not first address, check if should set as default
    let isDefault = 0;
    if (isFirstAddress) {
      isDefault = 1;
    }

    // Create address
    const address = await this.prisma.addresses.create({
      data: {
        user_id: userId,
        recipient_name: dto.recipient_name,
        phone: dto.phone,
        address_line: dto.address_line,
        city: dto.city,
        district: dto.district,
        ward: dto.ward,
        postal_code: dto.postal_code,
        address_type: dto.address_type || 'home',
        is_default: isDefault,
      },
    });

    this.logger.log(`Created address ${address.id} for user ${userId}`);

    return this.formatAddressResponse(address);
  }

  /**
   * Get all addresses for authenticated user
   * Security: Users can only see their own addresses
   */
  async findAll(userId: number) {
    const addresses = await this.prisma.addresses.findMany({
      where: { user_id: userId },
      orderBy: [
        { is_default: 'desc' }, // Default address first
        { created_at: 'desc' },
      ],
    });

    return addresses.map((addr) => this.formatAddressResponse(addr));
  }

  /**
   * Get single address by ID
   * Security: Validates ownership
   */
  async findOne(userId: number, addressId: number) {
    const address = await this.prisma.addresses.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Security: Verify ownership
    if (address.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this address',
      );
    }

    return this.formatAddressResponse(address);
  }

  /**
   * Get default address for user
   */
  async findDefault(userId: number) {
    const address = await this.prisma.addresses.findFirst({
      where: {
        user_id: userId,
        is_default: 1,
      },
    });

    if (!address) {
      throw new NotFoundException('No default address found');
    }

    return this.formatAddressResponse(address);
  }

  /**
   * Update address
   * Security: Validates ownership, validates phone format
   */
  async update(userId: number, addressId: number, dto: UpdateAddressDto) {
    // Find and validate ownership
    const address = await this.prisma.addresses.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Security: Verify ownership
    if (address.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this address',
      );
    }

    // Security: Validate phone if provided
    if (dto.phone) {
      const phoneRegex = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
      if (!phoneRegex.test(dto.phone)) {
        throw new BadRequestException('Invalid phone number format');
      }
    }

    // Update address
    const updatedAddress = await this.prisma.addresses.update({
      where: { id: addressId },
      data: {
        recipient_name: dto.recipient_name,
        phone: dto.phone,
        address_line: dto.address_line,
        city: dto.city,
        district: dto.district,
        ward: dto.ward,
        postal_code: dto.postal_code,
        address_type: dto.address_type,
        updated_at: new Date(),
      },
    });

    this.logger.log(`Updated address ${addressId} for user ${userId}`);

    return this.formatAddressResponse(updatedAddress);
  }

  /**
   * Set address as default
   * Security: Validates ownership, ensures only one default per user
   */
  async setDefault(userId: number, addressId: number) {
    // Find and validate ownership
    const address = await this.prisma.addresses.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Security: Verify ownership
    if (address.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this address',
      );
    }

    // If already default, no action needed
    if (address.is_default === 1) {
      return this.formatAddressResponse(address);
    }

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      // Unset all other default addresses for this user
      await tx.addresses.updateMany({
        where: {
          user_id: userId,
          is_default: 1,
        },
        data: {
          is_default: 0,
        },
      });

      // Set this address as default
      await tx.addresses.update({
        where: { id: addressId },
        data: {
          is_default: 1,
          updated_at: new Date(),
        },
      });
    });

    this.logger.log(`Set address ${addressId} as default for user ${userId}`);

    // Fetch updated address
    const updatedAddress = await this.prisma.addresses.findUnique({
      where: { id: addressId },
    });

    return this.formatAddressResponse(updatedAddress!);
  }

  /**
   * Delete address
   * Security: Validates ownership, prevents deleting last address if it's default
   */
  async remove(userId: number, addressId: number) {
    // Find and validate ownership
    const address = await this.prisma.addresses.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Security: Verify ownership
    if (address.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this address',
      );
    }

    // Check if this is the last address and it's default
    const totalAddresses = await this.prisma.addresses.count({
      where: { user_id: userId },
    });

    // If deleting default address and there are other addresses
    if (address.is_default === 1 && totalAddresses > 1) {
      // Use transaction to set another address as default
      await this.prisma.$transaction(async (tx) => {
        // Delete the address
        await tx.addresses.delete({
          where: { id: addressId },
        });

        // Set the most recent address as default
        const nextAddress = await tx.addresses.findFirst({
          where: { user_id: userId },
          orderBy: { created_at: 'desc' },
        });

        if (nextAddress) {
          await tx.addresses.update({
            where: { id: nextAddress.id },
            data: { is_default: 1 },
          });
        }
      });

      this.logger.log(
        `Deleted address ${addressId} and set new default for user ${userId}`,
      );
    } else {
      // Just delete the address
      await this.prisma.addresses.delete({
        where: { id: addressId },
      });

      this.logger.log(`Deleted address ${addressId} for user ${userId}`);
    }

    return {
      message: 'Address deleted successfully',
    };
  }

  /**
   * Validate address for order
   * Used internally by Orders module
   */
  async validateAddressForOrder(userId: number, addressId: number) {
    const address = await this.prisma.addresses.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Security: Verify ownership
    if (address.user_id !== userId) {
      throw new ForbiddenException('Cannot use this address for order');
    }

    return true;
  }

  /**
   * Format address response
   * Private helper to ensure consistent output
   */
  private formatAddressResponse(address: any) {
    return {
      id: address.id,
      recipient_name: address.recipient_name,
      phone: address.phone,
      address_line: address.address_line,
      city: address.city,
      district: address.district,
      ward: address.ward,
      postal_code: address.postal_code,
      address_type: address.address_type,
      is_default: Boolean(address.is_default),
      full_address: this.formatFullAddress(address),
      created_at: address.created_at,
      updated_at: address.updated_at,
    };
  }

  /**
   * Format full address string
   * Private helper for displaying complete address
   */
  private formatFullAddress(address: any): string {
    const parts = [address.address_line];

    if (address.ward) parts.push(address.ward);
    if (address.district) parts.push(address.district);
    parts.push(address.city);
    if (address.postal_code) parts.push(address.postal_code);

    return parts.join(', ');
  }
}
