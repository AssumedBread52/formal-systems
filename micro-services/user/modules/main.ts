import { NestFactory } from '@nestjs/core';
import { RedisOptions, Transport } from '@nestjs/microservices';
import { MainModule } from './main.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(MainModule, {
    abortOnError: false
  });

  app.connectMicroservice<RedisOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOSTNAME,
      port: 6379,
      password: process.env.REDIS_PASSWORD
    }
  });

  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(5002);
};

bootstrap();
