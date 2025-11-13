import prisma from '../config/database';
import { ERROR_MESSAGES } from '../config/constants';

export interface UpdateProfileDTO {
    phone?: string;
}

export interface CreateAddressDTO {
    streetAddress: string;
    city: string;
    region?: string;
    postalCode?: string;
    country: string;
    addressType: 'shipping' | 'billing';
    isDefault?: boolean;
}

export const userService = {
    async getUserProfile(userId: number) {
        const user = await prisma.siteUser.findUnique({
            where: { id: userId },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        return user;
    },

    async updateUserProfile(userId: number, dto: UpdateProfileDTO) {
        const user = await prisma.siteUser.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const updatedUser = await prisma.siteUser.update({
            where: { id: userId },
            data: {
                ...(dto.phone && { phone: dto.phone }),
            },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                isActive: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return updatedUser;
    },

    async getUserAddresses(userId: number) {
        const user = await prisma.siteUser.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const addresses = await prisma.userAddress.findMany({
            where: { userId },
            include: {
                address: true,
            },
        });

        return addresses;
    },

    async createUserAddress(userId: number, dto: CreateAddressDTO) {
        const user = await prisma.siteUser.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        // Create address
        const address = await prisma.address.create({
            data: {
                streetAddress: dto.streetAddress,
                city: dto.city,
                region: dto.region,
                postalCode: dto.postalCode,
                country: dto.country,
            },
        });

        // Link address to user
        const userAddress = await prisma.userAddress.create({
            data: {
                userId,
                addressId: address.id,
                addressType: dto.addressType,
                isDefault: dto.isDefault || false,
            },
            include: {
                address: true,
            },
        });

        return userAddress;
    },

    async updateUserAddress(userId: number, addressId: number, dto: Partial<CreateAddressDTO>) {
        const userAddress = await prisma.userAddress.findFirst({
            where: {
                userId,
                addressId,
            },
        });

        if (!userAddress) {
            throw new Error('Địa chỉ không tồn tại');
        }

        // Update address
        const updatedAddress = await prisma.address.update({
            where: { id: addressId },
            data: {
                ...(dto.streetAddress && { streetAddress: dto.streetAddress }),
                ...(dto.city && { city: dto.city }),
                ...(dto.region && { region: dto.region }),
                ...(dto.postalCode && { postalCode: dto.postalCode }),
                ...(dto.country && { country: dto.country }),
            },
        });

        // Update user address if needed
        if (dto.addressType) {
            await prisma.userAddress.update({
                where: {
                    userId_addressId: {
                        userId,
                        addressId,
                    },
                },
                data: {
                    addressType: dto.addressType,
                },
            });
        }

        return updatedAddress;
    },

    async deleteUserAddress(userId: number, addressId: number) {
        const userAddress = await prisma.userAddress.findFirst({
            where: {
                userId,
                addressId,
            },
        });

        if (!userAddress) {
            throw new Error('Địa chỉ không tồn tại');
        }

        // Delete user address relationship
        await prisma.userAddress.delete({
            where: {
                userId_addressId: {
                    userId,
                    addressId,
                },
            },
        });

        // Check if address is used by other users
        const otherUsers = await prisma.userAddress.count({
            where: { addressId },
        });

        // Delete address if not used by anyone
        if (otherUsers === 0) {
            await prisma.address.delete({
                where: { id: addressId },
            });
        }
    },

    async setDefaultAddress(userId: number, addressId: number) {
        const userAddress = await prisma.userAddress.findFirst({
            where: {
                userId,
                addressId,
            },
        });

        if (!userAddress) {
            throw new Error('Địa chỉ không tồn tại');
        }

        // Remove default from other addresses of same type
        await prisma.userAddress.updateMany({
            where: {
                userId,
                addressType: userAddress.addressType,
            },
            data: { isDefault: false },
        });

        // Set as default
        const updated = await prisma.userAddress.update({
            where: {
                userId_addressId: {
                    userId,
                    addressId,
                },
            },
            data: { isDefault: true },
            include: { address: true },
        });

        return updated;
    },

    async getUserPaymentMethods(userId: number) {
        const user = await prisma.siteUser.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const payments = await prisma.userPayment.findMany({
            where: { userId },
            include: {
                paymentMethod: true,
            },
        });

        return payments;
    },
};
