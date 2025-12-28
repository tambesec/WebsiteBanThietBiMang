import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  /**
   * Public endpoint - Subscribe to newsletter
   */
  @Public()
  @Post('subscribe')
  @ApiOperation({ summary: 'Đăng ký nhận newsletter (công khai)' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  async subscribe(@Body() dto: SubscribeNewsletterDto) {
    await this.newsletterService.subscribe(dto);
    return {
      message: 'Cảm ơn bạn đã đăng ký! Chúng tôi sẽ gửi tin tức mới nhất đến email của bạn.',
    };
  }

  /**
   * Admin endpoint - Get all subscribers
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách subscribers (Admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'unsubscribed'] })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    const result = await this.newsletterService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 50,
      status,
    );
    return { data: result };
  }

  /**
   * Admin endpoint - Get statistics
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thống kê newsletter (Admin)' })
  async getStats() {
    return this.newsletterService.getStats();
  }

  /**
   * Public endpoint - Unsubscribe from newsletter
   */
  @Public()
  @Post('unsubscribe')
  @ApiOperation({ summary: 'Hủy đăng ký newsletter (công khai)' })
  async unsubscribe(@Body('email') email: string) {
    await this.newsletterService.unsubscribe(email);
    return {
      message: 'Bạn đã hủy đăng ký nhận tin thành công.',
    };
  }

  /**
   * Admin endpoint - Delete subscriber
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa subscriber (Admin)' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.newsletterService.delete(id);
    return {
      message: 'Đã xóa subscriber thành công',
    };
  }
}
