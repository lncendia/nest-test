import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AccountService } from './services/account.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { UserPayload } from '../common/jwt/jwt.strategy';
import { VerifyTwoFactorRequest } from './requests/verify-2fa.request';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('setup-2fa')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('jwt')
  setupTwoFactor(@Req() req: Request & { user: UserPayload }) {
    return this.accountService.setupTwoFactor(req.user.id);
  }

  @Post('verify-2fa')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('jwt')
  verifyTwoFactor(
    @Req() req: Request & { user: UserPayload },
    @Body() request: VerifyTwoFactorRequest,
  ) {
    return this.accountService.verifyTwoFactor(req.user.id, request.code);
  }
}
