import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequest {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email для регистрации',
  })
  @IsEmail({}, { message: 'Невалидный email' })
  email: string;

  @ApiProperty({
    example: 'securepassword123',
    description: 'Пароль (минимум 6 символов)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  password: string;
}
