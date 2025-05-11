import { Injectable } from '@nestjs/common';
import { TokenProviderService } from './token-provider.service';
import { User } from '../models/user.model';
import { authenticator } from 'otplib';

@Injectable()
export class AuthenticatorTokenProvider implements TokenProviderService {
  /**
   * Генерирует секрет для 2FA
   */
  generate(_purpose: string, user: User): string {
    if (user.authenticatorKey) return user.authenticatorKey;
    return authenticator.generateSecret();
  }

  /**
   * Проверяет валидность 2FA кода
   */
  validate(_purpose: string, user: User, token: string): boolean {
    if (!user.authenticatorKey || !this.isValidToken(token)) {
      return false;
    }

    return authenticator.check(token, user.authenticatorKey);
  }

  private isValidToken(token: string): boolean {
    return /^\d{6}$/.test(token);
  }
}
