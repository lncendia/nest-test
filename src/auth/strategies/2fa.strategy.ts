import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TwoFactorStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validate({ email, password });
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
