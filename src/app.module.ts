import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from './common/logger/logger.module';
import JsonLoader from './common/config/json.loader';
import { AccountModule } from './account/account.module';
import { JwtModule } from './common/jwt/jwt.module';
import { MailingModule } from './common/mailing/mailing.module';

@Module({
  imports: [
    AuthModule,
    AccountModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [JsonLoader('configuration/app.config.json')],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow('ConnectionStrings:Mongo'),
      }),
      inject: [ConfigService],
    }),
    MailingModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        host: config.getOrThrow('SMTP_HOST'),
        port: config.getOrThrow('SMTP_PORT'),
        secure: config.getOrThrow('SMTP_SECURE'),
        auth: {
          user: config.getOrThrow('SMTP_USER'),
          pass: config.getOrThrow('SMTP_PASS'),
        },
        from: config.getOrThrow('SMTP_FROM'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    LoggerModule,
    JwtModule,
  ],
})
export class AppModule {}
