import { Injectable, LoggerService as NestLogger, Scope } from '@nestjs/common';
import { Logger as WinstonLogger } from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLogger {
  private context?: string;

  constructor(private readonly logger: WinstonLogger) {}

  setContext(context: string): void {
    this.context = context;
  }

  // Логирование с указанием контекста
  log(message: string, context?: string) {
    this.logger.info(message, { context: context ?? this.context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context: context ?? this.context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context ?? this.context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context ?? this.context });
  }
}
