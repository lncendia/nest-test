import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { WebhookConfiguration } from '../config/webhook.configuration';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class WebhookService implements OnModuleInit {
  constructor(
    private readonly bot: TelegramBot,
    private readonly configuration: WebhookConfiguration,
    private readonly logger: LoggerService,
  ) {
    logger.setContext(WebhookService.name);
  }

  async onModuleInit() {
    const options = {
      secret_token: this.configuration.Secret,
      drop_pending_updates: true,
    };

    await this.bot.setWebHook(this.configuration.Url, options);
    this.logger.log('WebhookService initialized successfully.');
  }
}
