import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from './jwt.config';

interface TokenPayload {
  sub: string;
  email: string;
}

export interface UserPayload {
  id: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: JwtConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.issuerSigningKey,
      issuer: config.validIssuer,
      audience: config.validAudience,
    });
  }

  validate(payload: TokenPayload): UserPayload {
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
