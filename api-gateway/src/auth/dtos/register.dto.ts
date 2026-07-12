import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

enum Role {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
}

export class RegisterDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(180)
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
    minLength: 4,
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(120)
  password: string;

  @ApiProperty({
    description: 'Primeiro nome do usuário',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  firstName: string;

  @ApiProperty({
    description: 'Último nome do usuário',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  lastName: string;

  @ApiProperty({
    description: 'Role do usuário',
    example: 'ADMIN',
    enum: ['ADMIN', 'CUSTOMER', 'SELLER'],
    default: 'CUSTOMER',
  })
  @IsString()
  @IsOptional()
  @IsIn(Object.values(Role))
  role?: Role;
}
