import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { CustomLoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // bufferLogs: true, // Optionally buffer logs until CustomLogger is ready
  });

  // Use custom logger
  app.useLogger(app.get(CustomLoggerService));

  // Register global exception filter - Pass logger to filter if it's not injected via DI
  // If GlobalExceptionFilter is registered in AppModule providers and uses DI for logger, this direct instantiation is not ideal.
  // For now, assuming GlobalExceptionFilter will get logger via DI if it's a provider.
  // If not, it needs to be passed: app.useGlobalFilters(new GlobalExceptionFilter(app.get(CustomLoggerService)));
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(CustomLoggerService)));
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('BitForge API')
    .setDescription('API for BitForge BTC yield platform on Starknet')
    .setVersion('1.0')
    .addTag('yield')
    .addTag('starknet')
    .addTag('btc')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
  const logger = app.get(CustomLoggerService);
  logger.log('Application is starting...', 'Bootstrap');
  
  await app.listen(3000);
  logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
