import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtConfig, JwtConfigFactory } from './jwt.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtTwoFactorStrategy } from './jwt-two-factor.strategy';

@Module({
  imports: [NestJwtModule, ConfigModule],
  providers: [
    JwtService,
    {
      provide: JwtConfig,
      useFactory: JwtConfigFactory,
      inject: [ConfigService],
    },
    JwtStrategy,
    JwtTwoFactorStrategy,
  ],
  exports: [JwtService],
})
export class JwtModule {}
