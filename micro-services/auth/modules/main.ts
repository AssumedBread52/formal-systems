import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(MainModule, {
    abortOnError: false
  });

  await app.listen(5001);
};

bootstrap();
