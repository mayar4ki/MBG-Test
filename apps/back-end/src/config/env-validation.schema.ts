import { z } from 'zod';

export const envValidationSchema = z.object({
  // Server Configuration
  PORT: z.preprocess((val) => {
    if (val === undefined || val === '') {
      throw new Error('PORT is required');
    }
    return parseInt(String(val), 10);
  }, z.number().int().min(1).max(65535)),
  JWT_SECRET: z.string().min(10).default('dev-jwt-secret'),
});

export type Env = z.infer<typeof envValidationSchema>;

/**
 * Typed ConfigService for environment variables
 * Use this instead of ConfigService for type-safe access to environment variables
 *
 * @example
 * ```typescript
 * import { ConfigService } from '@nestjs/config';
 * import { Env } from '../config/env-validation.schema';
 *
 * constructor(private readonly configService: ConfigService<Env>) {
 *   // Use { infer: true } for automatic type inference
 *   const port = this.configService.get('PORT', { infer: true }); // TypeScript knows this is a number
 *   const dbUrl = this.configService.get('DATABASE_URL', { infer: true }); // TypeScript knows this is a string
 * }
 * ```
 */
export type TypedConfigService = import('@nestjs/config').ConfigService<Env>;

/**
 * Validate and parse environment variables
 * Throws an error with detailed messages if validation fails
 */
export function validateEnv(env: any): Env {
  try {
    return envValidationSchema.parse(env);
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        console.error(`  - ${path}: ${issue.message}`);
      });
    } else {
      console.error(error);
    }
    throw error;
  }
}
