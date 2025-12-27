import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator
 * Restricts route access to specific user roles
 * Must be used with RolesGuard
 * 
 * Usage:
 * @Roles('admin')
 * @Get('admin-only')
 * adminRoute() { ... }
 * 
 * @Roles('admin', 'customer')
 * @Get('multi-role')
 * multiRoleRoute() { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
