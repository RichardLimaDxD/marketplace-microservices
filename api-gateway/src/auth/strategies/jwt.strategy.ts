import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../service/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  validate(payload: {
    token: string;
    sub: string;
    email: string;
    roles: string[];
  }) {
    if (!payload) throw new UnauthorizedException('Invalid token');

    const user = this.authService.validateJwtToken(payload.token);

    if (!user) throw new UnauthorizedException('Invalid token');

    return { userId: payload.sub, email: payload.email, role: payload.roles };
  }
}
