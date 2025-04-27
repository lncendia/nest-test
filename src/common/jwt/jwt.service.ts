import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { createCipheriv, createDecipheriv } from 'crypto';
import { JwtConfig } from './jwt.config';

// Декоратор, который делает класс доступным для внедрения зависимостей в NestJS
@Injectable()
export class JwtService {
  // Алгоритм шифрования для refresh-токенов (AES с 256-битным ключом и CBC режимом)
  private readonly algorithm = 'aes-256-cbc';

  // Конструктор сервиса, принимает:
  // 1. Стандартный JwtService из NestJS для работы с JWT
  // 2. Конфигурацию JWT, содержащую все необходимые настройки
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly config: JwtConfig,
  ) {}

  /**
   * Генерация JWT токена доступа
   * @param claims - набор утверждений (claims) для включения в токен
   * @param tokenId - уникальный идентификатор токена
   * @param idp - необязательный идентификатор провайдера аутентификации
   * @returns подписанный JWT токен в виде строки
   */
  generateAccessToken(
    claims: Record<string, string | string[]>,
    tokenId: string,
    idp?: string,
  ): string {
    // Формируем payload токена:
    const payload = {
      ...claims, // Копируем все переданные claims
      jti: tokenId, // Уникальный идентификатор токена (JWT ID)
      iat: Math.floor(Date.now() / 1000), // Время выпуска токена (в секундах с эпохи UNIX)
      aud: this.config.issuedAudiences, // Аудитории, для которых предназначен токен
      iss: this.config.validIssuer, // Издатель токена
      ...(idp && { idp }), // Добавляем провайдера аутентификации, если он передан
    };

    // Создаем и подписываем JWT токен:
    return this.nestJwtService.sign(payload, {
      expiresIn: this.config.accessTokenLifetime, // Время жизни токена
      secret: this.config.issuerSigningKey, // Секретный ключ для подписи
    });
  }

  /**
   * Генерация refresh-токена (зашифрованного с использованием AES-256-CBC)
   * @param tokenId - уникальный идентификатор токена
   * @returns объект с зашифрованным токеном и сроком его действия в днях
   */
  generateRefreshToken(tokenId: string): {
    token: string;
    expiresInDays: number;
  } {
    // Вычисляем время истечения токена (текущее время + количество дней из конфига)
    const expiration =
      Date.now() + this.config.refreshTokenValidityInDays * 86400000; // 86400000 мс = 1 день

    // Данные для сохранения в refresh-токене
    const payload = { tokenId, expiration };

    // Создаем шифровальщик с указанными:
    // - алгоритмом (aes-256-cbc)
    // - ключом (из конфига, декодированным из base64)
    // - вектором инициализации (из конфига, декодированным из base64)
    const cipher = createCipheriv(
      this.algorithm,
      Buffer.from(this.config.refreshTokenKey, 'base64'),
      Buffer.from(this.config.refreshTokenIV, 'base64'),
    );

    // Шифруем данные:
    // 1. Преобразуем payload в JSON строку и шифруем
    // 2. Финализируем шифрование
    // 3. Объединяем результаты и кодируем в base64
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(payload), 'utf8'),
      cipher.final(),
    ]).toString('base64');

    // Возвращаем зашифрованный токен и срок его действия
    return {
      token: encrypted,
      expiresInDays: this.config.refreshTokenValidityInDays,
    };
  }

  /**
   * Валидация JWT токена
   * @param token - токен для проверки
   * @param ignoreExpiration - игнорировать ли срок действия токена
   * @returns декодированный payload токена
   * @throws ошибку, если токен невалиден
   */
  private validateToken(
    token: string,
    ignoreExpiration = false,
  ): Record<string, string | string[]> {
    return this.nestJwtService.verify(token, {
      secret: this.config.issuerSigningKey, // Ключ для проверки подписи
      ignoreExpiration, // Флаг игнорирования срока действия
      issuer: this.config.validIssuer, // Ожидаемый издатель токена
      audience: this.config.issuedAudiences, // Ожидаемые аудитории
    });
  }

  /**
   * Расшифровка refresh-токена
   * @param encryptedToken - зашифрованный токен
   * @returns объект с идентификатором токена и временем его истечения
   */
  private decryptRefreshToken(encryptedToken: string): {
    tokenId: string;
    expiration: number;
  } {
    // Создаем дешифровальщик с теми же параметрами, что и при шифровании
    const decipher = createDecipheriv(
      this.algorithm,
      Buffer.from(this.config.refreshTokenKey, 'base64'),
      Buffer.from(this.config.refreshTokenIV, 'base64'),
    );

    // Дешифруем данные:
    // 1. Декодируем base64
    // 2. Дешифруем
    // 3. Объединяем результаты
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedToken, 'base64')),
      decipher.final(),
    ]).toString('utf8');

    // Преобразуем JSON строку в объект
    return JSON.parse(decrypted) as {
      tokenId: string;
      expiration: number;
    };
  }

  /**
   * Проверка пары токенов (access + refresh)
   * @param accessToken - JWT токен доступа
   * @param refreshToken - зашифрованный refresh-токен
   * @returns payload access-токена, если проверка прошла успешно
   * @throws ошибку, если:
   * - refresh-токен просрочен
   * - идентификаторы токенов не совпадают
   * - токены невалидны
   */
  validateTokenPair(
    accessToken: string,
    refreshToken: string,
  ): Record<string, string | string[]> {
    // Проверяем access-токен (игнорируя срок действия)
    const accessPayload = this.validateToken(accessToken, true);

    // Расшифровываем refresh-токен
    const refreshData = this.decryptRefreshToken(refreshToken);

    // Проверяем, что refresh-токен не просрочен
    if (refreshData.expiration < Date.now())
      throw new Error('Refresh token expired');

    // Проверяем, что идентификаторы токенов совпадают
    if (accessPayload.jti !== refreshData.tokenId)
      throw new Error('Token mismatch');

    const metaFields = ['jti', 'iat', 'aud', 'iss', 'exp', 'nbf', 'idp'];

    const cleanedPayload: Record<string, string | string[]> = {};

    for (const key in accessPayload) {
      if (!metaFields.includes(key)) {
        cleanedPayload[key] = accessPayload[key];
      }
    }

    // Возвращаем payload access-токена
    return cleanedPayload;
  }
}
