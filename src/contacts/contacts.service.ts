import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto, ContactStatus } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new contact submission (public - no auth required)
   */
  async create(createContactDto: CreateContactDto) {
    const contact = await this.prisma.contacts.create({
      data: {
        first_name: createContactDto.first_name,
        last_name: createContactDto.last_name,
        email: createContactDto.email,
        phone: createContactDto.phone,
        subject: createContactDto.subject,
        message: createContactDto.message,
        status: 'new',
        is_read: 0,
      },
    });

    return contact;
  }

  /**
   * Get all contacts with filters (admin only)
   */
  async findAll(
    page = 1,
    limit = 20,
    status?: ContactStatus,
    isRead?: boolean,
    search?: string,
    sortBy = 'created_at',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (isRead !== undefined) {
      where.is_read = isRead ? 1 : 0;
    }

    if (search) {
      where.OR = [
        { first_name: { contains: search } },
        { last_name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { subject: { contains: search } },
        { message: { contains: search } },
      ];
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contacts.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.contacts.count({ where }),
    ]);

    return {
      contacts,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
        has_next_page: page * limit < total,
        has_prev_page: page > 1,
      },
    };
  }

  /**
   * Get contact by ID (admin only)
   */
  async findOne(id: number) {
    const contact = await this.prisma.contacts.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException(`Không tìm thấy liên hệ với ID ${id}`);
    }

    return contact;
  }

  /**
   * Update contact (admin only)
   */
  async update(id: number, updateContactDto: UpdateContactDto) {
    // Check if contact exists
    await this.findOne(id);

    const updateData: any = {
      updated_at: new Date(),
    };

    if (updateContactDto.status) {
      updateData.status = updateContactDto.status;
    }

    if (updateContactDto.admin_note !== undefined) {
      updateData.admin_note = updateContactDto.admin_note;
    }

    if (updateContactDto.is_read !== undefined) {
      updateData.is_read = updateContactDto.is_read ? 1 : 0;
    }

    return this.prisma.contacts.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Mark contact as read
   */
  async markAsRead(id: number) {
    await this.findOne(id);

    return this.prisma.contacts.update({
      where: { id },
      data: {
        is_read: 1,
        status: 'read',
        updated_at: new Date(),
      },
    });
  }

  /**
   * Delete contact (admin only)
   */
  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.contacts.delete({
      where: { id },
    });

    return { message: 'Xóa liên hệ thành công' };
  }

  /**
   * Get unread contacts count (for admin dashboard)
   */
  async getUnreadCount() {
    const count = await this.prisma.contacts.count({
      where: { is_read: 0 },
    });

    return { unread_count: count };
  }

  /**
   * Get contacts statistics (for admin dashboard)
   */
  async getStats() {
    const [total, newCount, readCount, repliedCount, resolvedCount, spamCount] = await Promise.all([
      this.prisma.contacts.count(),
      this.prisma.contacts.count({ where: { status: 'new' } }),
      this.prisma.contacts.count({ where: { status: 'read' } }),
      this.prisma.contacts.count({ where: { status: 'replied' } }),
      this.prisma.contacts.count({ where: { status: 'resolved' } }),
      this.prisma.contacts.count({ where: { status: 'spam' } }),
    ]);

    return {
      total,
      by_status: {
        new: newCount,
        read: readCount,
        replied: repliedCount,
        resolved: resolvedCount,
        spam: spamCount,
      },
    };
  }
}
