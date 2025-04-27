import { Injectable } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { MessageCommandFactory } from './message-command.factory';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class HandlerService {
  constructor(
    private readonly messageCommandFactory: MessageCommandFactory,
    private readonly commandBus: CommandBus,
  ) {}

  async handleCommand(update: TelegramBot.Update) {
    if (update.message) {
      const command = this.messageCommandFactory.create(update.message);
      if (!command) return;
      await this.commandBus.execute(command);
    }
  }
}
