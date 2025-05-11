import { Injectable } from '@nestjs/common';
import { UserManager } from '../../user/services/user-manager.service';
import { authenticator } from 'otplib';
import { VerifyTwoFactorResponse } from '../responses/verify-2fa.response';
import { SetupTwoFactorResponse } from '../responses/setup-2fa.response';

@Injectable()
export class AccountService {
  constructor(private readonly userManager: UserManager) {}

  async setupTwoFactor(userId: string): Promise<SetupTwoFactorResponse> {
    const user = await this.userManager.findById(userId);

    if (!user) throw new Error('User not found');

    const key = await this.userManager.setAuthenticatorSecret(user);

    const keyuri = authenticator.keyuri(user.email, 'nest-test', key);

    return {
      key: key,
      url: keyuri,
    };
  }

  async verifyTwoFactor(
    userId: string,
    code: string,
  ): Promise<VerifyTwoFactorResponse> {
    const user = await this.userManager.findById(userId);

    if (!user) throw new Error('User not found');

    await this.userManager.setTwoFactorEnabled(user, code);

    return { recoveryCodes: user.recoveryCodes };
  }
}
