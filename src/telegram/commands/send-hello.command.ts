import { TelegramCommand } from './telegram.command';
import { Chat } from 'node-telegram-bot-api';

export class SendHelloCommand extends TelegramCommand {
  constructor(
    public text: string,
    chat: Chat,
  ) {
    super(chat);
  }
}
