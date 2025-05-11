import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from './jwt.config';

interface TokenPayload {
  sub: string;
}

export interface TwoFactorPayload {
  id: string;
}

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(Strategy, '2fa') {
  constructor(config: JwtConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.issuerSigningKey,
      issuer: config.validIssuer,
      audience: config.twoFactorAudience,
    });
  }

  validate(payload: TokenPayload) {
    return {
      userId: payload.sub,
    };
  }
}
