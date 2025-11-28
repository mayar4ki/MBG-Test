import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../config/env-validation.schema';
import { AuthService } from './auth.service';

const base64UrlEncode = (input: string): string =>
  Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

describe('AuthService', () => {
  let service: AuthService;
  const config = new ConfigService<Env>({ PORT: 3000, JWT_SECRET: 'unit-test-secret' } as any);

  beforeEach(() => {
    service = new AuthService(config);
  });

  it('issues a token for any credentials', () => {
    const response = service.login({ email: 'tester@example.com', password: 'secret' } as any);

    expect(response.accessToken).toBeDefined();
    expect(response.user.email).toBe('tester@example.com');
    expect(response.user.displayName).toBe('tester');
    expect(response.user.sub).toHaveLength(12);
  });

  it('verifies its own tokens', () => {
    const { accessToken, user } = service.login({ email: 'valid@example.com', password: 'password' } as any);

    const payload = service.verifyToken(accessToken);

    expect(payload.email).toBe(user.email);
    expect(payload.sub).toBe(user.sub);
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it('rejects tampered tokens', () => {
    const { accessToken } = service.login({ email: 'valid@example.com', password: 'password' } as any);
    const [header, payload, signature] = accessToken.split('.');
    const alteredPayload = base64UrlEncode(
      JSON.stringify({ email: 'evil@example.com', exp: Math.floor(Date.now() / 1000) + 1000 }),
    );
    const tampered = `${header}.${alteredPayload}.${signature}`;

    expect(() => service.verifyToken(tampered)).toThrow(UnauthorizedException);
  });
});
