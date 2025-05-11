import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequest {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail({}, { message: 'Неверный формат email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @ApiProperty({
    example: 'mypassword123',
    description: 'Пароль пользователя',
  })
  @IsString({ message: 'Пароль обязателен' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;
}
