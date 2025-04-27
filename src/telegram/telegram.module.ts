import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WebhookConfiguration,
  WebhookConfigurationFactory,
} from './config/webhook.configuration';
import { WebhookService } from './services/webhook.service';
import { TelegramController } from './telegram.controller';
import { HandlerService } from './services/handler.service';
import { BotClientModule } from '../common/bot-client/bot-client.module';
import { CqrsModule } from '@nestjs/cqrs';
import { MessageCommandFactory } from './services/message-command.factory';
import { SendHelloHandler } from './commands/handlers/send-hello.handler';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [BotClientModule, CqrsModule, LoggerModule],
  providers: [
    WebhookService,
    HandlerService,
    SendHelloHandler,
    MessageCommandFactory,
    {
      provide: WebhookConfiguration,
      useFactory: WebhookConfigurationFactory,
      inject: [ConfigService],
    },
  ],
  controllers: [TelegramController],
})
export class TelegramModule {}
