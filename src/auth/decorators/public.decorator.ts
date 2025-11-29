import { SetMetadata } from '@nestjs/common';

/**
 * Public decorator
 * Marks a route as public (bypasses JWT authentication)
 * 
 * Usage:
 * @Public()
 * @Get('public-route')
 * publicRoute() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
