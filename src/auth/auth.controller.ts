import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { RegisterRequest } from './requests/register-request';
import { RefreshTokenRequest } from './requests/refresh-token.request';
import { LoginRequest } from './requests/login-request';
import { TwoFactorStrategy } from './strategies/2fa.strategy';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Метод для регистрации пользователя
  @Post('register')
  async register(@Body() dto: RegisterRequest) {
    return this.authService.register(dto);
  }

  // Метод для аутентификации (логин)
  @UseGuards(TwoFactorStrategy)
  @Post('authenticate')
  async authenticate(@Req() req, @Body() dto: LoginRequest) {
    const user = this.authService.authenticate(dto);
    await req.logout();
    return user;
  }

  // Метод для обновления токенов
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenRequest) {
    return this.authService.refresh(dto);
  }
}
