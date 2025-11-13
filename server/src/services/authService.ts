import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ERROR_MESSAGES } from '../config/constants';

export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponse {
    id: number;
    email: string;
    username: string;
    accessToken: string;
    refreshToken: string;
}

export const authService = {
    async register(dto: RegisterDTO): Promise<AuthResponse> {
        // Check if user already exists
        const existingUser = await prisma.siteUser.findFirst({
            where: {
                OR: [{ email: dto.email }, { username: dto.username }],
            },
        });

        if (existingUser) {
            throw new Error(
                existingUser.email === dto.email
                    ? ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
                    : ERROR_MESSAGES.USERNAME_ALREADY_EXISTS
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(dto.password);

        // Create user
        const user = await prisma.siteUser.create({
            data: {
                username: dto.username,
                email: dto.email,
                phone: dto.phone,
                passwordHash: hashedPassword,
                isEmailVerified: false,
                isActive: true,
            },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        // Generate tokens
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            username: user.username,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            roles: user.roles.map((ur: any) => ur.role.name),
        });

        const refreshToken = generateRefreshToken({
            id: user.id,
            email: user.email,
            username: user.username,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            roles: user.roles.map((ur: any) => ur.role.name),
        });

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            accessToken,
            refreshToken,
        };
    },

    async login(dto: LoginDTO): Promise<AuthResponse> {
        // Find user by email
        const user = await prisma.siteUser.findUnique({
            where: { email: dto.email },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        // Check if user is active
        if (!user.isActive) {
            throw new Error('Tài khoản đã bị vô hiệu hóa');
        }

        // Verify password
        const isPasswordValid = await comparePassword(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        // Reset failed login count
        await prisma.siteUser.update({
            where: { id: user.id },
            data: { failedLoginCount: 0 },
        });

        // Generate tokens
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            username: user.username,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            roles: user.roles.map((ur: any) => ur.role.name),
        });

        const refreshToken = generateRefreshToken({
            id: user.id,
            email: user.email,
            username: user.username,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            roles: user.roles.map((ur: any) => ur.role.name),
        });

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            accessToken,
            refreshToken,
        };
    },

    async logout(userId: number): Promise<void> {
        // Delete all sessions for user
        await prisma.userSession.deleteMany({
            where: { userId },
        });
    },

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = verifyRefreshToken(refreshToken);

        // Verify user still exists
        const user = await prisma.siteUser.findUnique({
            where: { id: payload.id },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
            },
        });

        if (!user || !user.isActive) {
            throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            username: user.username,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            roles: user.roles.map((ur: any) => ur.role.name),
        });

        const newRefreshToken = generateRefreshToken({
            id: user.id,
            email: user.email,
            username: user.username,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            roles: user.roles.map((ur: any) => ur.role.name),
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    },

    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
        const user = await prisma.siteUser.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        // Verify old password
        const isPasswordValid = await comparePassword(oldPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Mật khẩu cũ không đúng');
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Save old password to history
        await prisma.passwordHistory.create({
            data: {
                userId,
                passwordHash: user.passwordHash,
            },
        });

        // Update password
        await prisma.siteUser.update({
            where: { id: userId },
            data: { passwordHash: hashedNewPassword },
        });
    },
};
