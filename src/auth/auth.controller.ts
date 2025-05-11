import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { RegisterRequest } from './requests/register.request';
import { RefreshTokenRequest } from './requests/refresh-token.request';
import { LoginRequest } from './requests/login.request';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticateTwoFactorRequest } from './requests/authenticate-2fa.request';
import { Request } from 'express';
import { TwoFactorPayload } from '../common/jwt/jwt-two-factor.strategy';

/**
 * Контроллер для обработки запросов аутентификации и авторизации
 * Все маршруты начинаются с префикса '/auth'
 */
@Controller('auth')
export class AuthController {
  // Инъекция сервиса аутентификации через конструктор
  constructor(private readonly authService: AuthService) {}

  /**
   * Обработчик регистрации нового пользователя
   * @param dto - DTO с данными для регистрации
   * @returns Результат операции регистрации
   */
  @Post('register')
  async register(@Body() dto: RegisterRequest) {
    return this.authService.register(dto);
  }

  /**
   * Обработчик аутентификации пользователя (логин)
   * @param dto - DTO с учетными данными пользователя
   * @returns Результат аутентификации (токены доступа)
   */
  @Post('authenticate')
  authenticate(@Body() dto: LoginRequest) {
    return this.authService.authenticate(dto);
  }

  /**
   * Обработчик аутентификации с двухфакторной авторизацией
   * Защищен guard'ом 2FA
   * @param req - Запрос, содержащий payload пользователя после первой фазы аутентификации
   * @param dto - DTO с кодом двухфакторной аутентификации
   * @returns Полные токены доступа после успешной двухфакторной аутентификации
   */
  @UseGuards(AuthGuard('2fa'))
  @Post('authenticate-2fa')
  authenticateTwoFactor(
    @Req() req: Request & { user: TwoFactorPayload },
    @Body() dto: AuthenticateTwoFactorRequest,
  ) {
    return this.authService.authenticateWithTwoFactor({
      ...dto,
      userId: req.user.id,
    });
  }

  /**
   * Обработчик обновления токенов доступа
   * @param dto - DTO с refresh токеном
   * @returns Новые access и refresh токены
   */
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenRequest) {
    return this.authService.refresh(dto);
  }
}
