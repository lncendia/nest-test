import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendHelloCommand } from '../send-hello.command';
import * as TelegramBot from 'node-telegram-bot-api';

@CommandHandler(SendHelloCommand)
export class SendHelloHandler implements ICommandHandler<SendHelloCommand> {
  constructor(private telegramClient: TelegramBot) {}

  async execute(command: SendHelloCommand) {
    await this.telegramClient.sendMessage(command.chat.id, command.text);
  }
}
