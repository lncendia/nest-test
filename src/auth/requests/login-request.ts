import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginRequest {
  @IsEmail({}, { message: 'Неверный формат email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @IsString({ message: 'Пароль обязателен' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;
}
