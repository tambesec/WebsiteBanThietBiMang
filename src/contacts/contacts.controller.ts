import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto, ContactStatus } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  /**
   * Public endpoint - Submit contact form
   */
  @Public()
  @Post()
  @ApiOperation({ summary: 'Gửi form liên hệ (công khai)' })
  @ApiResponse({ status: 201, description: 'Gửi liên hệ thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(@Body() createContactDto: CreateContactDto) {
    const contact = await this.contactsService.create(createContactDto);
    return {
      message: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.',
      contact_id: contact.id,
    };
  }

  /**
   * Admin endpoint - Get all contacts
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách liên hệ (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ContactStatus })
  @ApiQuery({ name: 'is_read', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort_by', required: false, type: String })
  @ApiQuery({ name: 'sort_order', required: false, enum: ['asc', 'desc'] })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ContactStatus,
    @Query('is_read') isRead?: string,
    @Query('search') search?: string,
    @Query('sort_by') sortBy?: string,
    @Query('sort_order') sortOrder?: 'asc' | 'desc',
  ) {
    const result = await this.contactsService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      status,
      isRead !== undefined ? isRead === 'true' : undefined,
      search,
      sortBy || 'created_at',
      sortOrder || 'desc',
    );
    return { data: result };
  }

  /**
   * Admin endpoint - Get unread count
   */
  @Get('unread-count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy số liên hệ chưa đọc (Admin)' })
  async getUnreadCount() {
    return this.contactsService.getUnreadCount();
  }

  /**
   * Admin endpoint - Get statistics
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thống kê liên hệ (Admin)' })
  async getStats() {
    return this.contactsService.getStats();
  }

  /**
   * Admin endpoint - Get single contact
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem chi tiết liên hệ (Admin)' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.findOne(id);
  }

  /**
   * Admin endpoint - Update contact
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật liên hệ (Admin)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactsService.update(id, updateContactDto);
  }

  /**
   * Admin endpoint - Mark as read
   */
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đánh dấu đã đọc (Admin)' })
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.markAsRead(id);
  }

  /**
   * Admin endpoint - Delete contact
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa liên hệ (Admin)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.remove(id);
  }
}
