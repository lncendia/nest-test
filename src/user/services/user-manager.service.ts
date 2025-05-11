import { UserRepository } from '../repositories/user.repository';
import { UserValidatorService } from '../validators/user-validator.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../models/user.model';
import { PasswordHasher } from './password-hasher.service';
import { PasswordValidatorService } from '../validators/password-validator.service';
import { Inject, Injectable } from '@nestjs/common';
import { TokenProviderService } from '../token-providers/token-provider.service';
import { randomInt } from 'crypto';

/**
 * Сервис для управления пользователями
 * Обеспечивает основные CRUD операции и бизнес-логику работы с пользователями
 */
@Injectable()
export class UserManager {
  constructor(
    // Репозиторий для работы с базой данных пользователей
    private userRepository: UserRepository,

    // Валидатор данных пользователя
    private userValidator: UserValidatorService,

    // Валидатор сложности пароля
    private passwordValidator: PasswordValidatorService,

    // Сервис хеширования паролей
    private passwordHasher: PasswordHasher,

    // Провайдер токенов для email подтверждения (инжектится по токену)
    @Inject('EmailTokenProvider')
    emailTokenGenerator: TokenProviderService,

    // Провайдер токенов для двухфакторной аутентификации (инжектится по токену)
    @Inject('AuthenticatorTokenProvider')
    authenticatorTokenGenerator: TokenProviderService,
  ) {
    this.tokenProviders = {
      email: emailTokenGenerator,
      authenticator: authenticatorTokenGenerator,
    };
  }

  private readonly tokenProviders: Record<string, TokenProviderService>;

  /**
   * Находит пользователя по email
   * @param email Email пользователя для поиска
   * @returns Найденный пользователь или null если не найден
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Находит пользователя по идентификатору
   * @param id Уникальный идентификатор пользователя
   * @returns Найденный пользователь или null если не найден
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Создает нового пользователя
   * @param dto DTO с данными для создания пользователя
   * @returns Созданный пользователь
   * @throws Ошибка валидации если данные неверные
   */
  async create(dto: CreateUserDto): Promise<User> {
    // Создаем нового пользователя
    const user = new User();

    // Устанавливаем email из DTO
    user.email = dto.email;

    // Валидируем данные пользователя
    await this.userValidator.validate(user);

    // Проверяем сложность пароля
    await this.passwordValidator.validate(dto.password);

    // Хешируем пароль перед сохранением
    user.passwordHash = await this.passwordHasher.hash(dto.password);

    // Обновляем security stamp (метка безопасности)
    this.updateSecurityStamp(user);

    // Сохраняем пользователя в базу данных
    return await this.userRepository.add(user);
  }

  /**
   * Аутентификация пользователя по паролю
   * @param user Пользователь для аутентификации
   * @param password Пароль для проверки
   * @throws Ошибка если пароль неверный
   */
  async passwordAuthenticate(user: User, password: string) {
    // Сравниваем хеш введенного пароля с хешем в базе
    if (!(await this.passwordHasher.compare(password, user.passwordHash)))
      throw new Error('Неверный пароль');
  }

  /**
   * Генерирует токен подтверждения email
   * @param user Пользователь для которого генерируется токен
   * @returns Сгенерированный токен подтверждения
   * @throws Ошибка если email уже подтвержден
   */
  generateEmailConfirmationToken(user: User): string {
    // Проверяем что email еще не подтвержден
    if (user.emailConfirmed) throw new Error('Email уже подтвержден');

    // Генерируем токен подтверждения
    return this.tokenProviders['email'].generate('EmailConfirmation', user);
  }

  /**
   * Подтверждает email пользователя по токену
   * @param user Пользователь для подтверждения
   * @param token Токен подтверждения
   * @throws Ошибка если email уже подтвержден или токен неверный
   */
  async confirmEmail(user: User, token: string) {
    // Проверяем что email еще не подтвержден
    if (user.emailConfirmed) throw new Error('Email уже подтвержден');

    // Валидируем токен подтверждения
    const validationResult = this.tokenProviders['email'].validate(
      'EmailConfirmation',
      user,
      token,
    );
    if (!validationResult) throw new Error('Неверный токен подтверждения');

    // Устанавливаем флаг подтверждения email
    user.emailConfirmed = true;

    // Обновляем метку безопасности
    this.updateSecurityStamp(user);

    // Сохраняем изменения в базе
    await this.userRepository.update(user);
  }

  /**
   * Обновляет метку безопасности пользователя
   * @param user Пользователь для обновления
   */
  private updateSecurityStamp(user: User) {
    // Генерируем новый UUID как метку безопасности
    user.securityStamp = crypto.randomUUID();
  }

  /**
   * Удаляет пользователя по идентификатору
   * @param userId Идентификатор пользователя для удаления
   */
  async deleteUser(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }

  /**
   * Устанавливает секретный ключ аутентификатора для пользователя
   * @param user Пользователь для настройки
   * @returns Сгенерированный секретный ключ
   */
  async setAuthenticatorSecret(user: User): Promise<string> {
    // Генерируем новый секретный ключ для 2FA
    user.authenticatorKey = this.tokenProviders['authenticator'].generate(
      'Authenticator secret',
      user,
    );

    // Сохраняем изменения в базе
    await this.userRepository.update(user);

    // Возвращаем сгенерированный ключ
    return user.authenticatorKey;
  }

  /**
   * Включает двухфакторную аутентификацию после проверки кода
   * @param user Пользователь для настройки
   * @param code Код подтверждения из приложения аутентификатора
   * @throws Ошибка если код неверный
   */
  async setTwoFactorEnabled(user: User, code: string): Promise<void> {
    if (user.twoFactorEnabled) throw new Error('Two factor already enabled');

    // Проверяем валидность кода подтверждения
    const validationResult = this.tokenProviders['authenticator'].validate(
      'Authenticator secret',
      user,
      code,
    );

    if (!validationResult) throw new Error('Неверный код подтверждения');

    // Активируем двухфакторную аутентификацию
    user.twoFactorEnabled = true;

    // Обновляем метку безопасности
    this.updateSecurityStamp(user);

    // Генерация 5 случайных 6-значных кодов восстановления
    user.recoveryCodes = Array.from({ length: 5 }, () =>
      randomInt(100000, 1000000).toString(),
    );

    // Сохраняем изменения в базе
    await this.userRepository.update(user);
  }

  /**
   * @param user
   * @param provider
   */
  generateTwoFactorToken(user: User, provider: string): string {
    return this.tokenProviders[provider].generate('TwoFactor', user);
  }

  /**
   * @param user
   * @param provider
   */
  verifyTwoFactorToken(user: User, provider: string, code: string): boolean {
    return this.tokenProviders[provider].validate('TwoFactor', user, code);
  }

  /**
   * Проверяет и погашает (удаляет) одноразовый резервный код для двухфакторной аутентификации.
   * Каждый код может быть использован только один раз.
   *
   * @param user Пользователь, у которого проверяется код
   * @param code Введённый резервный код
   * @returns true, если код был действительным и успешно погашен; иначе false
   */
  async redeemTwoFactorRecoveryCode(
    user: User,
    code: string,
  ): Promise<boolean> {
    const codeIndex = user.recoveryCodes.findIndex((token) => token === code);

    if (codeIndex === -1) {
      return false;
    }

    // Удаляем использованный код
    user.recoveryCodes.splice(codeIndex, 1);

    // Обновляем пользователя в базе данных
    await this.userRepository.update(user);

    return true;
  }
}
