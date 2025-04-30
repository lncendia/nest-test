import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PasswordHasherModule } from './common/password-hasher/password-hasher.module';
import { TokenGeneratorModule } from './common/token-generator/token-generator.module';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from './common/logger/logger.module';
import JsonLoader from './common/config/json.loader';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot(
      'mongodb://root:toor@localhost:27017/nest?authSource=admin',
    ),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [JsonLoader('configuration/app.config.json')],
    }),
    UserModule,
    PasswordHasherModule,
    TokenGeneratorModule,
    LoggerModule,
  ],
})
export class AppModule {}
