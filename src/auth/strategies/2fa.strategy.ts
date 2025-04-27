import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from '../../common/jwt/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: JwtConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.issuerSigningKey,
      issuer: config.validIssuer,
      audience: config.issuedAudiences,
      ignoreExpiration: false,
    });
  }

  validate(payload: User) {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
