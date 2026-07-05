import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom, timeout } from 'rxjs';
import { gatewayConfigs } from 'src/config/gateway.config';

export interface UserSession {
  valid: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  } | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  validateJwtToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateSessionToken(sessionToken: string): Promise<UserSession> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<UserSession>(
          `${gatewayConfigs.users.url}/sessions/validate/${sessionToken}`,
          { timeout: gatewayConfigs.users.timeout },
        ),
      );
      return data;
    } catch (error) {
      throw new UnauthorizedException('Invalid session token');
    }
  }

  async login(loginDto: { email: string; password: string }): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<string>(
          `${gatewayConfigs.users.url}/login`,
          loginDto,
          { timeout: gatewayConfigs.users.timeout },
        ),
      );
      return data;
    } catch (error) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async register(registerDto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<string>(
          `${gatewayConfigs.users.url}/register`,
          registerDto,
          { timeout: gatewayConfigs.users.timeout },
        ),
      );
      return data;
    } catch (error) {
      throw new BadRequestException('Failed to register user');
    }
  }
}
