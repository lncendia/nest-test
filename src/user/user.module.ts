import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { UserRepository } from './repositories/user.repository';
import { UserManager } from './services/user-manager.service';
import { UserValidator } from './services/user.validator';
import { PasswordValidator } from './services/password.validator';
import { PasswordHasherModule } from '../common/password-hasher/password-hasher.module';
import { TokenGeneratorModule } from '../common/token-generator/token-generator.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PasswordHasherModule,
    TokenGeneratorModule,
  ],
  providers: [
    UserRepository,
    UserValidator,
    PasswordValidator,
    UserManager,
    {
      provide: PasswordValidator,
      useFactory: () =>
        new PasswordValidator({
          allowedSpecialChars: '!@#$%^&*()-_',
          minLength: 5,
          requireSpecialChar: true,
          requireUppercase: true,
        }),
    },
  ],
  exports: [UserManager],
})
export class UserModule {}
