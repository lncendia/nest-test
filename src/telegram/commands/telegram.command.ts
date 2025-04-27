import { Chat } from 'node-telegram-bot-api';

export abstract class TelegramCommand {
  protected constructor(public chat: Chat) {}
}
