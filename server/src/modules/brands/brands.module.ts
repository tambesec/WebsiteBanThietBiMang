import { Module } from '@nestjs/common';
import { BrandsController, AdminBrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

@Module({
  controllers: [BrandsController, AdminBrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}
