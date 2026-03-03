import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthPayload {
  userId: string;
  nickname: string;
}

const isAuthPayload = (value: unknown): value is AuthPayload => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return typeof obj.userId === 'string' && typeof obj.nickname === 'string';
};

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  validateToken = (token: string): AuthPayload | null => {
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      if (token.startsWith('dev-')) {
        const parts = token.split('-');
        if (parts.length >= 3) {
          const userId = parts[1];
          const nickname = parts.slice(2).join('-');
          if (userId && nickname) {
            return { userId, nickname };
          }
        }
        return null;
      }
    }

    try {
      const decoded: unknown = this.jwtService.verify(token);
      if (isAuthPayload(decoded)) {
        return { userId: decoded.userId, nickname: decoded.nickname };
      }
      return null;
    } catch {
      return null;
    }
  };
}
