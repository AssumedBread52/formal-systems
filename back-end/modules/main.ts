import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(MainModule, {
    abortOnError: true
  });

  await app.listen(5000);
};

bootstrap();
