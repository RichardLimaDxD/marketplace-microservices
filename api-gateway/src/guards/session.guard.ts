import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthResponse, AuthService } from '@/auth/service/auth.service';
import { Request } from 'express';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const sessionToken = request.headers['x-session-token'] as string;

    if (!sessionToken)
      throw new UnauthorizedException('Session token is required');

    try {
      const session: AuthResponse =
        await this.authService.validateSessionToken(sessionToken);

      if (!session.access_token || !session.user)
        throw new UnauthorizedException('Invalid session');

      (request as unknown as AuthResponse).user = session.user;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid session');
    }
  }
}
