import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterRequest {
  @IsEmail({}, { message: 'Невалидный email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  password: string;
}
