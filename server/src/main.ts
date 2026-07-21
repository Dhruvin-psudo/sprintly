import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Logger as PinoLogger } from 'nestjs-pino';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));

  app.set('query parser', 'extended')

  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService)

  const publicAppUrl = configService.getOrThrow<string>('PUBLIC_APP_URL');
  const corsOrigins = publicAppUrl.includes(',')
    ? publicAppUrl.split(',').map((o) => o.trim())
    : [publicAppUrl];

  const bodyLimit = configService.get<string>('REQUEST_BODY_LIMIT', '100kb');
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);

  logger.log(`Application is running on port: ${port}`);
}
bootstrap();
