import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { gatewayConfigs } from '@/config/gateway.config';
import { LoginDto } from '@/auth/dtos/login.dto';
import { RegisterDto } from '@/auth/dtos/register.dto';

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

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  validateJwtToken(token: string): Promise<AuthResponse> {
    try {
      return this.jwtService.verifyAsync<AuthResponse>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateSessionToken(sessionToken: string): Promise<AuthResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<AuthResponse>(
          `${gatewayConfigs.users.url}/sessions/validate/${sessionToken}`,
          { timeout: gatewayConfigs.users.timeout },
        ),
      );
      return data;
    } catch {
      throw new UnauthorizedException('Invalid session token');
    }
  }

  async login(loginDto: LoginDto): Promise<string> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<string>(
          `${gatewayConfigs.users.url}/login`,
          loginDto,
          { timeout: gatewayConfigs.users.timeout },
        ),
      );
      return data;
    } catch {
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<AuthResponse>(
          `${gatewayConfigs.users.url}/register`,
          registerDto,
          { timeout: gatewayConfigs.users.timeout },
        ),
      );
      return data;
    } catch {
      throw new BadRequestException('Failed to register user');
    }
  }
}
