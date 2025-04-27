import * as crypto from 'crypto';
import * as base32 from 'hi-base32';
import { totp } from 'otplib';
import { Injectable } from '@nestjs/common';
import { TokenGeneratorService } from './token-generator.service';

@Injectable()
export class TotpGeneratorService implements TokenGeneratorService {
  private getModifier(purpose: string, userId: string): string {
    return `Totp:${purpose}:${userId}`;
  }

  private deriveSecret(securityStamp: string, modifier: string): string {
    const hmac = crypto.createHmac('sha256', securityStamp);
    hmac.update(modifier);
    const digest = hmac.digest(); // Buffer
    return base32.encode(digest).replace(/=+$/, ''); // Base32 без padding
  }

  generate(purpose: string, userId: string, securityStamp: string): string {
    const modifier = this.getModifier(purpose, userId);
    const secret = this.deriveSecret(securityStamp, modifier);
    return totp.generate(secret);
  }

  validate(
    purpose: string,
    userId: string,
    securityStamp: string,
    token: string,
  ): boolean {
    const modifier = this.getModifier(purpose, userId);
    const secret = this.deriveSecret(securityStamp, modifier);
    return totp.check(token, secret);
  }
}
