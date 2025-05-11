import * as crypto from 'crypto';
import * as base32 from 'hi-base32';
import { totp } from 'otplib';
import { Injectable } from '@nestjs/common';
import { TokenProviderService } from './token-provider.service';
import { User } from '../models/user.model';

@Injectable()
export class TotpSecurityStampBasedTokenProviderService
  implements TokenProviderService
{
  private getModifier(purpose: string, userId: string): string {
    return `Totp:${purpose}:${userId}`;
  }

  private deriveSecret(securityStamp: string, modifier: string): string {
    const hmac = crypto.createHmac('sha256', securityStamp);
    hmac.update(modifier);
    const digest = hmac.digest(); // Buffer
    return base32.encode(digest).replace(/=+$/, ''); // Base32 без padding
  }

  generate(purpose: string, user: User): string {
    const modifier = this.getModifier(purpose, user.id);
    const secret = this.deriveSecret(user.securityStamp, modifier);
    return totp.generate(secret);
  }

  validate(purpose: string, user: User, token: string): boolean {
    const modifier = this.getModifier(purpose, user.id);
    const secret = this.deriveSecret(user.securityStamp, modifier);
    return totp.check(token, secret);
  }
}
