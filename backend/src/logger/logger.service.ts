import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      levels: winston.config.npm.levels, // error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
      transports: [
        new winston.transports.Console({
          level: 'debug', // Log up to debug locally
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, trace }) => {
              return `${timestamp} [${level}] ${context ? '[' + context + '] ' : ''}${message}${trace ? '\n' + trace : ''}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/app.log',
          level: 'info', // Log info and above to app.log
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
          maxsize: 5 * 1024 * 1024, // 5MB
          maxFiles: 5, // Keep up to 5 log files
          tailable: true,
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error', // Log only errors to error.log
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
          maxsize: 5 * 1024 * 1024, // 5MB
          maxFiles: 5,
          tailable: true,
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
