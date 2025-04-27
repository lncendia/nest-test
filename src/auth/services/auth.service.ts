import { Injectable } from '@nestjs/common';
import { JwtService } from '../../common/jwt/jwt.service';
import { UserManager } from '../../user/services/user-manager.service';
import { RegisterData } from '../interfaces/register-data.interface';
import { User } from '../../user/models/user.model';
import { RegisterResponse } from '../responses/register.responce';
import { AuthenticateResponse } from '../responses/authenticate.responce';
import { LoginData } from '../interfaces/login-data.interface';
import { RefreshData } from '../interfaces/refresh.interface';

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
    };
  }

  async authenticate(data: LoginData): Promise<AuthenticateResponse> {
    const user = await this.userManager.findByEmail(data.email);

    if (!user) throw new Error('User not found');

    await this.userManager.passwordAuthenticate(user, data.password);

    const claims = this.claimsFactory(user);

    const tokenId = crypto.randomUUID();

    const accessToken = this.jwt.generateAccessToken(claims, tokenId);

    const refreshToken = this.jwt.generateRefreshToken(tokenId);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      refreshTokenValidity: refreshToken.expiresInDays,
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
    };
  }

  private claimsFactory(user: User): Record<string, any> {
    return {
      sub: user.id,
      email: user.email,
      email_confirmed: user.emailConfirmed,
      security_stamp: user.securityStamp,
    };
  }
}
