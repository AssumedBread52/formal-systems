import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { MainModule } from './main.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(MainModule, {
    abortOnError: false
  });

  app.use(cookieParser());

  app.enableCors();

  const configService = app.get(ConfigService);

  const port = configService.getOrThrow<number>('PORT');

  await app.listen(port);
};

bootstrap();
