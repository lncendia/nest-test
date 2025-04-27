import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookConfiguration {
  constructor(
    public readonly Secret: string,
    public readonly Url: string,
  ) {}
}

export const WebhookConfigurationFactory = (configService: ConfigService) => {
  const secret = configService.get<string>('Webhook.Secret');
  if (!secret) throw new Error('No secret provided');

  const url = configService.get<string>('Webhook.Url');
  if (!url) throw new Error('No url provided');
  return new WebhookConfiguration(secret, url);
};
