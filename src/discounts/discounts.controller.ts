import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { ValidateDiscountDto } from './dto/validate-discount.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Discounts')
@Controller('discounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create discount code (Admin)' })
  @ApiResponse({ status: 201, description: 'Discount created successfully' })
  @ApiBearerAuth()
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountsService.create(createDiscountDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all discount codes (Admin)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['all', 'active', 'expired', 'inactive'],
  })
  @ApiBearerAuth()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.discountsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
    );
  }

  @Get('statistics')
  @Roles('admin')
  @ApiOperation({ summary: 'Get discount statistics (Admin)' })
  @ApiBearerAuth()
  getStatistics() {
    return this.discountsService.getStatistics();
  }

  @Get('my-usage')
  @ApiOperation({ summary: 'Get my discount usage history' })
  @ApiBearerAuth()
  getMyUsage(@Request() req) {
    return this.discountsService.getUserUsage(req.user.id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate discount code' })
  @ApiResponse({ status: 200, description: 'Discount code is valid' })
  @ApiResponse({ status: 400, description: 'Invalid or expired discount code' })
  @ApiBearerAuth()
  validate(@Request() req, @Body() validateDto: ValidateDiscountDto) {
    return this.discountsService.validate(req.user.id, validateDto);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get discount by ID (Admin)' })
  @ApiParam({ name: 'id', description: 'Discount ID' })
  @ApiBearerAuth()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update discount code (Admin)' })
  @ApiParam({ name: 'id', description: 'Discount ID' })
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    return this.discountsService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete discount code (Admin)' })
  @ApiParam({ name: 'id', description: 'Discount ID' })
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.remove(id);
  }
}
