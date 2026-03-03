import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from './auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate = (context: ExecutionContext): boolean => {
    const client = context.switchToWs().getClient();

    if (client.data?.userId && client.data?.nickname) {
      return true;
    }

    const auth = client.handshake?.auth as Record<string, unknown> | undefined;

    const token =
      (auth?.token as string | undefined) ??
      this.extractBearerToken(client.handshake?.headers?.authorization);

    if (token) {
      const user = this.authService.validateToken(token);
      if (!user) {
        client.disconnect();
        throw new WsException('Invalid authentication token');
      }
      client.data = { userId: user.userId, nickname: user.nickname };
      return true;
    }

    const userId = auth?.userId as string | undefined;
    const nickname = auth?.nickname as string | undefined;
    if (userId && nickname) {
      client.data = { userId, nickname };
      return true;
    }

    client.disconnect();
    throw new WsException('Missing authentication');
  };

  private extractBearerToken = (authorization: string | undefined): string | null => {
    if (!authorization) {
      return null;
    }
    const parts = authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer' && parts[1]) {
      return parts[1];
    }
    return null;
  };
}
