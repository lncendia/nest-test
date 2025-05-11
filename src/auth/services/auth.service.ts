import { Injectable } from '@nestjs/common';
import { JwtService } from '../../common/jwt/jwt.service';
import { UserManager } from '../../user/services/user-manager.service';
import { RegisterData } from '../interfaces/register-data.interface';
import { User } from '../../user/models/user.model';
import { RegisterResponse } from '../responses/register.response';
import { AuthenticateResponse } from '../responses/authenticate.response';
import { LoginData } from '../interfaces/login-data.interface';
import { RefreshData } from '../interfaces/refresh.interface';
import { CodeType } from '../enums/code-type.enum ';
import { AuthenticateTwoFactorData } from '../interfaces/authenticate-2fa.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly userManager: UserManager,
  ) {}

  async register(data: RegisterData): Promise<RegisterResponse> {
    const user = await this.userManager.create(data);

    const claims = this.claimsFactory(user);

    const emailCode = this.userManager.generateEmailConfirmationToken(user);

    const tokenId = crypto.randomUUID();

    const accessToken = this.jwt.generateAccessToken(claims, tokenId);

    const refreshToken = this.jwt.generateRefreshToken(tokenId);

    return {
      accessToken,
      emailCode,
      refreshToken: refreshToken.token,
      refreshTokenValidity: refreshToken.expiresInDays,
      twoFactorRequired: false,
    };
  }

  async authenticateWithTwoFactor(
    data: AuthenticateTwoFactorData,
  ): Promise<AuthenticateResponse> {
    const user = await this.userManager.findById(data.userId);

    if (!user) throw new Error('User not found');

    let result: boolean;

    switch (data.type) {
      case CodeType.Authenticator:
        result = this.userManager.verifyTwoFactorToken(
          user,
          'authenticator',
          data.code,
        );
        break;

      case CodeType.Email:
        result = this.userManager.verifyTwoFactorToken(
          user,
          'email',
          data.code,
        );
        break;

      case CodeType.RecoveryCode:
        result = await this.userManager.redeemTwoFactorRecoveryCode(
          user,
          data.code,
        );
        break;

      default:
        throw new Error(`Unsupported code type: ${data.type}`);
    }

    if (!result) throw new Error('Code invalid');

    const claims = this.claimsFactory(user);

    const tokenId = crypto.randomUUID();

    const accessToken = this.jwt.generateAccessToken(claims, tokenId);

    const refreshToken = this.jwt.generateRefreshToken(tokenId);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      refreshTokenValidity: refreshToken.expiresInDays,
      twoFactorRequired: false,
    };
  }

  async authenticate(data: LoginData): Promise<AuthenticateResponse> {
    const user = await this.userManager.findByEmail(data.email);

    if (!user) throw new Error('User not found');

    await this.userManager.passwordAuthenticate(user, data.password);

    if (user.twoFactorEnabled) {
      const claims = this.twoFactorClaimsFactory(user);
      const tokenId = crypto.randomUUID();
      const accessToken = this.jwt.generateAccessToken(claims, tokenId, true);
      return {
        accessToken: accessToken,
        refreshToken: null,
        refreshTokenValidity: null,
        twoFactorRequired: true,
      };
    }

    const claims = this.claimsFactory(user);

    const tokenId = crypto.randomUUID();

    const accessToken = this.jwt.generateAccessToken(claims, tokenId);

    const refreshToken = this.jwt.generateRefreshToken(tokenId);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      refreshTokenValidity: refreshToken.expiresInDays,
      twoFactorRequired: false,
    };
  }

  async refresh(data: RefreshData): Promise<AuthenticateResponse> {
    const payload = this.jwt.validateTokenPair(
      data.accessToken,
      data.refreshToken,
    );

    if (!payload['sub'] || Array.isArray(payload['sub']))
      throw new Error('Unauthorized');

    if (!payload['security_stamp'] || Array.isArray(payload['security_stamp']))
      throw new Error('Unauthorized');

    const user = await this.userManager.findById(payload['sub']);

    if (!user) throw new Error('User not found');

    if (user.securityStamp != payload['security_stamp'])
      throw new Error('Unauthorized');

    const claims = this.claimsFactory(user);

    const tokenId = crypto.randomUUID();

    const accessToken = this.jwt.generateAccessToken(claims, tokenId);

    const refreshToken = this.jwt.generateRefreshToken(tokenId);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      refreshTokenValidity: refreshToken.expiresInDays,
      twoFactorRequired: false,
    };
  }

  private claimsFactory(user: User): Record<string, any> {
    return {
      sub: user.id,
      email: user.email,
      email_confirmed: user.emailConfirmed,
    };
  }

  private twoFactorClaimsFactory(user: User): Record<string, any> {
    return {
      sub: user.id,
    };
  }
}
