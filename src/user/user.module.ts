import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { UserRepository } from './repositories/user.repository';
import { UserManager } from './services/user-manager.service';
import { UserValidatorService } from './validators/user-validator.service';
import { PasswordValidatorService } from './validators/password-validator.service';
import { PasswordHasher } from './services/password-hasher.service';
import { TotpSecurityStampBasedTokenProviderService } from './token-providers/totp-security-stamp-based-token-provider.service';
import { AuthenticatorTokenProvider } from './token-providers/authenticator-token-provider.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    UserRepository,
    UserValidatorService,
    UserManager,
    PasswordHasher,
    {
      provide: PasswordValidatorService,
      useFactory: () =>
        new PasswordValidatorService({
          allowedSpecialChars: '!@#$%^&*()-_',
          minLength: 5,
          requireSpecialChar: true,
          requireUppercase: true,
        }),
    },
    {
      provide: 'EmailTokenProvider',
      useClass: TotpSecurityStampBasedTokenProviderService,
    },
    {
      provide: 'AuthenticatorTokenProvider',
      useClass: AuthenticatorTokenProvider,
    },
  ],
  exports: [UserManager],
})
export class UserModule {}
