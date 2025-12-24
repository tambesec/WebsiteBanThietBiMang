import { Injectable, NotFoundException, ConflictException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { QueryUsersDto, UserRole, UserStatus } from './dto/query-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Update admin profile with security restrictions
   * SECURITY FEATURES:
   * - Only allows updating full_name and phone
   * - Cannot change email, role, or account status
   * - Logs all profile changes for audit trail
   * - Validates admin role before allowing update
   */
  async updateAdminProfile(adminId: number, updateData: UpdateAdminProfileDto) {
    // Verify user exists and is admin
    const admin = await this.prisma.users.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        is_active: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Additional security check: Verify user is actually an admin
    if (admin.role !== 'admin') {
      throw new ConflictException('Only admin users can use this endpoint');
    }

    // Check if account is active
    if (admin.is_active !== 1) {
      throw new ConflictException('Account is inactive');
    }

    // Build update object - ONLY allow specific fields
    const updateFields: any = {};
    let hasChanges = false;

    if (updateData.full_name !== undefined && updateData.full_name !== admin.full_name) {
      updateFields.full_name = updateData.full_name;
      hasChanges = true;
    }

    if (updateData.phone !== undefined && updateData.phone !== admin.phone) {
      updateFields.phone = updateData.phone;
      hasChanges = true;
    }

    if (!hasChanges) {
      return {
        message: 'No changes detected',
        admin: {
          id: admin.id,
          email: admin.email,
          full_name: admin.full_name,
          phone: admin.phone,
          role: admin.role,
        },
      };
    }

    // Update admin profile
    const updatedAdmin = await this.prisma.users.update({
      where: { id: adminId },
      data: {
        ...updateFields,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        is_active: true,
        last_login: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Log the profile update for audit trail
    await this.prisma.security_logs.create({
      data: {
        user_id: adminId,
        event_type: 'ADMIN_PROFILE_UPDATE',
        details: JSON.stringify({
          changes: updateFields,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    this.logger.log(`Admin profile updated: ${updatedAdmin.email}`);

    return {
      message: 'Admin profile updated successfully',
      admin: updatedAdmin,
    };
  }

  /**
   * Get admin profile information
   */
  async getAdminProfile(adminId: number) {
    const admin = await this.prisma.users.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        is_active: true,
        is_email_verified: true,
        last_login: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (admin.role !== 'admin') {
      throw new ConflictException('Only admin users can access this endpoint');
    }

    return admin;
  }

  /**
   * Get all users (customers) with pagination and filters
   * ADMIN ONLY
   */
  async getAllUsers(query: QueryUsersDto) {
    const { page = 1, limit = 20, search, role, status } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search filter (full_name or email)
    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Role filter
    if (role && role !== UserRole.ALL) {
      where.role = role;
    }

    // Status filter
    if (status && status !== UserStatus.ALL) {
      where.is_active = status === UserStatus.ACTIVE ? 1 : 0;
    }

    // Get total count and users
    const [total, users] = await Promise.all([
      this.prisma.users.count({ where }),
      this.prisma.users.findMany({
        where,
        select: {
          id: true,
          email: true,
          full_name: true,
          phone: true,
          role: true,
          is_active: true,
          is_email_verified: true,
          last_login: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              orders: true,
              product_reviews: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  /**
   * Get user detail by ID
   * ADMIN ONLY
   */
  async getUserById(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        is_active: true,
        is_email_verified: true,
        failed_login_attempts: true,
        locked_until: true,
        last_login: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            orders: true,
            product_reviews: true,
            addresses: true,
          },
        },
        orders: {
          select: {
            id: true,
            order_number: true,
            total_amount: true,
            status_id: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 5, // Latest 5 orders
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user status (block/unblock)
   * ADMIN ONLY - Cannot modify other admins
   */
  async updateUserStatus(userId: number, updateStatusDto: UpdateUserStatusDto, adminId: number) {
    // Get target user
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Security: Prevent admin from modifying other admin accounts
    if (user.role === 'admin') {
      throw new ForbiddenException('Cannot modify admin accounts');
    }

    // Security: Prevent self-modification
    if (userId === adminId) {
      throw new ForbiddenException('Cannot modify your own account status');
    }

    // Update status
    const updatedUser = await this.prisma.users.update({
      where: { id: userId },
      data: {
        is_active: updateStatusDto.is_active ? 1 : 0,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        role: true,
        is_active: true,
        updated_at: true,
      },
    });

    // Log the action
    await this.prisma.security_logs.create({
      data: {
        user_id: adminId,
        event_type: 'USER_STATUS_UPDATE',
        details: JSON.stringify({
          target_user_id: userId,
          target_user_email: user.email,
          old_status: user.is_active === 1 ? 'active' : 'inactive',
          new_status: updateStatusDto.is_active ? 'active' : 'inactive',
          timestamp: new Date().toISOString(),
        }),
      },
    });

    this.logger.log(
      `Admin ${adminId} ${updateStatusDto.is_active ? 'activated' : 'deactivated'} user ${userId} (${user.email})`,
    );

    return {
      message: `User ${updateStatusDto.is_active ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    };
  }

  /**
   * Get users statistics
   * ADMIN ONLY
   */
  async getUsersStatistics() {
    const [
      totalUsers,
      totalCustomers,
      totalAdmins,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      usersLast30Days,
      usersLast7Days,
    ] = await Promise.all([
      this.prisma.users.count(),
      this.prisma.users.count({ where: { role: 'customer' } }),
      this.prisma.users.count({ where: { role: 'admin' } }),
      this.prisma.users.count({ where: { is_active: 1 } }),
      this.prisma.users.count({ where: { is_active: 0 } }),
      this.prisma.users.count({ where: { is_email_verified: 1 } }),
      this.prisma.users.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.users.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total: totalUsers,
      byRole: {
        customers: totalCustomers,
        admins: totalAdmins,
      },
      byStatus: {
        active: activeUsers,
        inactive: inactiveUsers,
      },
      verification: {
        verified: verifiedUsers,
        unverified: totalUsers - verifiedUsers,
      },
      newUsers: {
        last30Days: usersLast30Days,
        last7Days: usersLast7Days,
      },
    };
  }
}
