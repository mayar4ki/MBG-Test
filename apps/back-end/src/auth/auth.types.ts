export interface AuthenticatedUser {
  sub: string;
  email: string;
  displayName: string;
}

export interface JwtPayload extends AuthenticatedUser {
  iat: number;
  exp: number;
}
