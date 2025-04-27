import { Module } from '@nestjs/common';
import { TotpGeneratorService } from './totp-generator.service';

@Module({
  providers: [
    {
      provide: 'EmailTokenGenerator',
      useClass: TotpGeneratorService,
    },
    {
      provide: 'TwoFactorGenerator',
      useClass: TotpGeneratorService,
    },
  ],
  exports: ['EmailTokenGenerator', 'TwoFactorGenerator'],
})
export class TokenGeneratorModule {}
