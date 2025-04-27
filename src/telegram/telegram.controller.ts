import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WebhookRequest } from './requests/webhook.request';
import { WebhookGuard } from './guards/webhook.guard';
import { HandlerService } from './services/handler.service';

@Controller('webhook')
export class TelegramController {
  constructor(private readonly handlerService: HandlerService) {}

  @Post()
  @UseGuards(WebhookGuard)
  async handleWebhook(@Body() update: WebhookRequest) {
    await this.handlerService.handleCommand(update);

    return 'OK';
  }
}
