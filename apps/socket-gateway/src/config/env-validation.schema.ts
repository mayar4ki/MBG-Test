import { z } from 'zod';

export const envValidationSchema = z.object({
  // Server Configuration
  GATEWAY_PORT: z
    .preprocess((val) => {
      if (val === undefined || val === '') return undefined;
      return parseInt(String(val), 10);
    }, z.number().int().min(1).max(65535))
    .optional()
    .default(3001),

  // Redis Configuration (optional for horizontal scaling)
  REDIS_URL: z.string().optional(),

  // Auth introspection
  AUTH_INTROSPECT_URL: z.url(),
  AUTH_INTROSPECT_CACHE_TTL_MS: z
    .preprocess((val) => {
      if (val === undefined || val === '') return undefined;
      return parseInt(String(val), 10);
    }, z.number().int().min(1000))
    .optional()
    .default(30000),
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
 *   const port = this.configService.get('GATEWAY_PORT', { infer: true }); // TypeScript knows this is a number
 *   const redisUrl = this.configService.get('REDIS_URL', { infer: true }); // TypeScript knows this is string | undefined
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
