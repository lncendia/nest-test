import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { MAILING_OPTIONS } from './mailing.constants';
import { MailingAsyncOptions, MailingOptionsFactory } from './mailing.options';
import { MailingOptions } from './mailing.interface';

@Module({})
export class MailingModule {
  static forRoot(options: MailingOptions): DynamicModule {
    return {
      module: MailingModule,
      providers: [
        {
          provide: MAILING_OPTIONS,
          useValue: options,
        },
        MailingService,
      ],
      exports: [MailingService],
    };
  }

  static forRootAsync(options: MailingAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: MailingModule,
      imports: options.imports || [],
      providers: [...asyncProviders, MailingService],
      exports: [MailingService],
    };
  }

  private static createAsyncProviders(
    options: MailingAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: MAILING_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }

    const useClass = options.useClass || options.useExisting;
    if (!useClass) {
      throw new Error('Invalid configuration for MailingModule');
    }

    return [
      {
        provide: MAILING_OPTIONS,
        useFactory: async (factory: MailingOptionsFactory) =>
          await factory.createMailingOptions(),
        inject: [useClass],
      },
      ...(options.useClass ? [{ provide: useClass, useClass }] : []),
    ];
  }
}
