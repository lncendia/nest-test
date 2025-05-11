import { Module } from '@nestjs/common';
import { AccountService } from './services/account.service';
import { AccountController } from './account.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
