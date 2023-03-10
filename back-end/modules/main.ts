import { NestFactory } from '@nestjs/core';
import { MainModule } from './main-module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(MainModule);

  await app.listen(5000);
}

bootstrap();
