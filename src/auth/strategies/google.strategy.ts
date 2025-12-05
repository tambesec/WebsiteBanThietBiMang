/**
 * Google OAuth Strategy - DISABLED
 * 
 * OAuth functionality has been removed from this project.
 * The oauth_accounts table was removed in migration.
 * 
 * To re-enable OAuth:
 * 1. Add oauth_accounts model to prisma/schema.prisma
 * 2. Run: npx prisma migrate dev --name add_oauth
 * 3. Implement validateOAuthUser() in auth.service.ts
 * 4. Restore GoogleStrategy class below
 * 5. Register GoogleStrategy in auth.module.ts providers
 * 
 * File kept for reference only.
 */

// GoogleStrategy implementation removed - OAuth disabled
