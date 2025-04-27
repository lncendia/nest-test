import { Module } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: TelegramBot,
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('Telegram.Token');
        if (!token) throw new Error('No token provided');
        return new TelegramBot(token, { polling: false });
      },
      inject: [ConfigService],
    },
  ],
  exports: [TelegramBot],
})
export class BotClientModule {}
