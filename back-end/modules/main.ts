import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { readFileSync } from 'fs';
import { MainModule } from './main.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(MainModule, {
    abortOnError: false,
    httpsOptions: {
      cert: readFileSync('./public-certificate.pem'),
      key: readFileSync('./private-key.pem'),
      ca: readFileSync('./certificate-authority-public-certificate.pem')
    }
  });

  app.use(cookieParser());

  const configService = app.get(ConfigService);

  const port = configService.getOrThrow<number>('PORT');

  await app.listen(port);
};

bootstrap();
