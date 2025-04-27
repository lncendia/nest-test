import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { WebhookConfiguration } from '../config/webhook.configuration';
import { Request } from 'express';

@Injectable()
export class WebhookGuard implements CanActivate {
  constructor(private readonly configuration: WebhookConfiguration) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const token = req.header('X-Telegram-Bot-Api-Secret-Token');

    if (!token) {
      throw new UnauthorizedException('Секретный токен отсутствует.');
    }

    if (token !== this.configuration.Secret) {
      throw new ForbiddenException('Неверный секретный токен.');
    }

    return true;
  }
}
