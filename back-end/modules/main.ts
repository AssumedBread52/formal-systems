import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { readFileSync } from 'fs';
import { MainModule } from './main.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(MainModule, {
    abortOnError: false,
    httpsOptions: {
      cert: readFileSync('./security/public-certificate.pem'),
      key: readFileSync('./security/private-key.pem'),
      ca: readFileSync('./security/certificate-authority-public-certificate.pem')
    }
  });

  app.set('query parser', 'extended');

  app.use(cookieParser());

  const configService = app.get(ConfigService);

  const port = configService.getOrThrow<number>('PORT');

  await app.listen(port);
};

bootstrap();
