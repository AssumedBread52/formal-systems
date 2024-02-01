import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { MainModule } from './main.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(MainModule, {
    abortOnError: false
  });

  app.use(cookieParser());

  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }));

  const configService = app.get(ConfigService);

  const port = configService.getOrThrow<number>('PORT');

  await app.listen(port);
};

bootstrap();
