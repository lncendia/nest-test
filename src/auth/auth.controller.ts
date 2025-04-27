import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { RegisterRequest } from './requests/register-request';
import { RefreshTokenRequest } from './requests/refresh-token.request';
import { LoginRequest } from './requests/login-request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Метод для регистрации пользователя
  @Post('register')
  async register(@Body() dto: RegisterRequest) {
    return this.authService.register(dto);
  }

  // Метод для аутентификации (логин)
  @Post('authenticate')
  async authenticate(@Body() dto: LoginRequest) {
    return this.authService.authenticate(dto);
  }

  // Метод для обновления токенов
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenRequest) {
    return this.authService.refresh(dto);
  }
}
