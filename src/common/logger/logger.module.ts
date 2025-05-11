import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import * as winston from 'winston';
import { Logger as WinstonLogger } from 'winston';
import * as chalk from 'chalk';
import { TransformableInfo } from 'logform';
import 'winston-daily-rotate-file';

@Module({
  providers: [
    LoggerService,
    {
      provide: WinstonLogger,
      useFactory: () => {
        return winston.createLogger({
          level: 'info',
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                consoleLogFormat,
              ),
            }),
            new winston.transports.DailyRotateFile({
              dirname: 'logs', // папка для логов
              filename: 'app-%DATE%.log', // шаблон имени файлов
              datePattern: 'YYYY-MM-DD', // каждый день новый файл
              zippedArchive: true, // можно включить сжатие старых логов в .gz (по желанию)
              maxFiles: '14d', // храним файлы 14 дней
              level: 'warn',
              format: winston.format.combine(
                winston.format.timestamp({ format: 'HH:mm:ss' }),
                winston.format.json(),
              ),
            }),
          ],
        });
      },
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}

// Настройка формата для логгера
const consoleLogFormat = winston.format.printf((message: LogMessage) => {
  let colorLevel;
  const time = new Date(message.timestamp).toLocaleTimeString(); // Форматируем только время

  // Устанавливаем цвета для уровней логирования
  switch (message.level) {
    case 'info':
      colorLevel = chalk.blue(message.level);
      break;
    case 'warn':
      colorLevel = chalk.yellow(message.level);
      break;
    case 'error':
      colorLevel = chalk.red(message.level);
      break;
    default:
      colorLevel = message.level;
  }

  return `${chalk.green(`[${time}]`)} ${chalk.magenta(`[${message.context}]`)} ${colorLevel}: ${message.message}`;
});

interface LogMessage extends TransformableInfo {
  message: string;
  timestamp: string;
  context: string;
}
