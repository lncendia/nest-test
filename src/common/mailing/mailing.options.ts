import { ModuleMetadata, Type } from '@nestjs/common';
import { MailingOptions } from './mailing.interface';

export interface MailingOptionsFactory {
  createMailingOptions(): Promise<MailingOptions> | MailingOptions;
}

export interface MailingAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<MailingOptionsFactory>;
  useClass?: Type<MailingOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<MailingOptions> | MailingOptions;
  inject?: any[];
}
