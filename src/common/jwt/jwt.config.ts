import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtConfig {
  constructor(
    public readonly issuerSigningKey: string,
    public readonly refreshTokenKey: string,
    public readonly refreshTokenIV: string,
    public readonly validIssuer: string,
    // public readonly validAudience: string,
    public readonly issuedAudiences: string[],
    public readonly refreshTokenValidityInDays: number,
    public readonly accessTokenLifetime: string,
  ) {}
}

export const JwtConfigFactory = (configService: ConfigService) => {
  // Получаем параметры из конфигурации (аналогично Webhook.Secret/Url)
  const issuerSigningKey = configService.get<string>('Jwt.IssuerSigningKey');
  if (!issuerSigningKey) throw new Error('JWT signing key not provided');

  const refreshTokenKey = configService.get<string>('Jwt.RefreshTokenKey');
  if (!refreshTokenKey) throw new Error('JWT refresh token key not provided');

  const refreshTokenIV = configService.get<string>('Jwt.RefreshTokenIV');
  if (!refreshTokenIV) throw new Error('JWT refresh token IV not provided');

  const validIssuer = configService.get<string>('Jwt.ValidIssuer');
  if (!validIssuer) throw new Error('JWT valid issuer not provided');

  const audiences = configService.get<string[]>('Jwt.IssuedAudiences');
  if (!audiences) throw new Error('JWT audiences not provided');

  // Параметры с значениями по умолчанию
  const refreshTokenValidityInDays = configService.get<number>(
    'Jwt.RefreshTokenValidityInDays',
    7,
  );
  const accessTokenLifetime = configService.get<string>(
    'Jwt.AccessTokenLifetime',
    '1h',
  );

  return new JwtConfig(
    issuerSigningKey,
    refreshTokenKey,
    refreshTokenIV,
    validIssuer,
    audiences,
    refreshTokenValidityInDays,
    accessTokenLifetime,
  );
};
