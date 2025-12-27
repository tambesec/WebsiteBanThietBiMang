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
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  /**
   * Create new address
   * Protected: Requires authentication
   */
  @Post()
  @ApiOperation({
    summary: 'Create new address',
    description:
      'Create a new shipping/billing address for authenticated user. First address is automatically set as default.',
  })
  @ApiResponse({
    status: 201,
    description: 'Address created successfully',
    schema: {
      example: {
        id: 1,
        recipient_name: 'Nguyễn Văn A',
        phone: '0901234567',
        address_line: '123 Nguyễn Huệ',
        city: 'Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        postal_code: '700000',
        address_type: 'home',
        is_default: true,
        full_address:
          '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Hồ Chí Minh, 700000',
        created_at: '2025-12-05T10:00:00.000Z',
        updated_at: '2025-12-05T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or phone format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  create(@Request() req, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(req.user.id, createAddressDto);
  }

  /**
   * Get all addresses for current user
   * Protected: Returns only user's own addresses
   */
  @Get()
  @ApiOperation({
    summary: 'Get all addresses',
    description:
      'Get all addresses for authenticated user. Default address appears first.',
  })
  @ApiResponse({
    status: 200,
    description: 'Addresses retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          recipient_name: 'Nguyễn Văn A',
          phone: '0901234567',
          address_line: '123 Nguyễn Huệ',
          city: 'Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé',
          postal_code: '700000',
          address_type: 'home',
          is_default: true,
          full_address:
            '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, Hồ Chí Minh, 700000',
          created_at: '2025-12-05T10:00:00.000Z',
          updated_at: '2025-12-05T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  findAll(@Request() req) {
    return this.addressesService.findAll(req.user.id);
  }

  /**
   * Get default address
   * Protected: Returns user's default address
   */
  @Get('default')
  @ApiOperation({
    summary: 'Get default address',
    description: 'Get the default address for authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Default address retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'No default address found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  findDefault(@Request() req) {
    return this.addressesService.findDefault(req.user.id);
  }

  /**
   * Get single address by ID
   * Protected: Validates ownership
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get address by ID',
    description: 'Get a specific address by ID. Validates ownership.',
  })
  @ApiParam({
    name: 'id',
    description: 'Address ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Address retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not owner of this address',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.findOne(req.user.id, id);
  }

  /**
   * Update address
   * Protected: Validates ownership
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update address',
    description: 'Update an existing address. Validates ownership.',
  })
  @ApiParam({
    name: 'id',
    description: 'Address ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or phone format',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not owner of this address',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(req.user.id, id, updateAddressDto);
  }

  /**
   * Set address as default
   * Protected: Validates ownership, ensures only one default
   */
  @Patch(':id/default')
  @ApiOperation({
    summary: 'Set address as default',
    description:
      'Set an address as default. Automatically unsets other default addresses.',
  })
  @ApiParam({
    name: 'id',
    description: 'Address ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Default address set successfully',
    schema: {
      example: {
        id: 1,
        recipient_name: 'Nguyễn Văn A',
        is_default: true,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not owner of this address',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  setDefault(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.setDefault(req.user.id, id);
  }

  /**
   * Delete address
   * Protected: Validates ownership, handles default address logic
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete address',
    description:
      'Delete an address. If deleting default address, automatically sets another as default.',
  })
  @ApiParam({
    name: 'id',
    description: 'Address ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Address deleted successfully',
    schema: {
      example: {
        message: 'Address deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not owner of this address',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.remove(req.user.id, id);
  }
}
