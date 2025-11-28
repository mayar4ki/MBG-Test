import crypto from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../config/env-validation.schema';
import { LoginDto } from './dto/login.dto';
import type { AuthenticatedUser, JwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService<Env>) {}

  login(dto: LoginDto) {
    const user = this.buildUser(dto.email);
    const payload = this.buildPayload(user);

    return {
      accessToken: this.signToken(payload),
      user,
    };
  }

  verifyToken(token: string): JwtPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Invalid token format');
    }

    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = this.sign(unsignedToken, this.getSecret());

    if (!timingSafeEqual(signature, expectedSignature)) {
      throw new UnauthorizedException('Invalid token signature');
    }

    const payload = decodePayload(encodedPayload);

    if (payload.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  private signToken(payload: JwtPayload): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`, this.getSecret());

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private sign(message: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret).update(message).digest();
    return base64UrlBuffer(hmac);
  }

  private buildPayload(user: AuthenticatedUser): JwtPayload {
    const now = Math.floor(Date.now() / 1000);
    const expiresInSeconds = 60 * 60 * 8; // 8 hours

    return {
      ...user,
      iat: now,
      exp: now + expiresInSeconds,
    };
  }

  private buildUser(email: string): AuthenticatedUser {
    const displayName = email.split('@')[0] || 'user';
    const sub = crypto.createHash('sha1').update(email).digest('hex').slice(0, 12);

    return {
      sub,
      email,
      displayName,
    };
  }

  private getSecret(): string {
    return this.configService.get('JWT_SECRET', { infer: true }) ?? 'dev-jwt-secret';
  }
}

const base64UrlEncode = (input: string): string =>
  Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const base64UrlBuffer = (input: Buffer): string =>
  input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const decodePayload = (payload: string): JwtPayload => {
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const json = Buffer.from(padded, 'base64').toString('utf8');

  return JSON.parse(json) as JwtPayload;
};

const timingSafeEqual = (provided: string, expected: string): boolean => {
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);

  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
};
