import { Injectable } from '@nestjs/common';
import { Message } from 'node-telegram-bot-api';
import { ICommand } from '@nestjs/cqrs';
import { SendHelloCommand } from '../commands/send-hello.command';

@Injectable()
export class MessageCommandFactory {
  create(message: Message): ICommand | undefined {
    if (message.text == 'хуй') {
      return new SendHelloCommand('Сам ты хуй сука', message.chat);
    }
  }
}
