import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/**
 * DTO for updating a category
 * All fields are optional (partial update)
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
