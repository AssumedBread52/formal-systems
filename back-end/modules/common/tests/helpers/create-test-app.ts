import { AppModule } from '@/app/app.module';
import { AuthModule } from '@/auth/auth.module';
import { HealthModule } from '@/health/health.module';
import { StatementEntity } from '@/statement/statement.entity';
import { StatementModule } from '@/statement/statement.module';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SymbolModule } from '@/symbol/symbol.module';
import { MongoSystemEntity } from '@/system/entities/mongo-system.entity';
import { SystemModule } from '@/system/system.module';
import { MongoUserEntity } from '@/user/entities/mongo-user.entity';
import { UserModule } from '@/user/user.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';
import { MongoRepository } from 'typeorm';

export const createTestApp = async (): Promise<INestApplication> => {
  const testingModule = await Test.createTestingModule({
    imports: [
      AppModule,
      AuthModule,
      EventEmitterModule.forRoot(),
      GraphQLModule.forRootAsync({
        driver: ApolloDriver,
        useFactory: (): Omit<ApolloDriverConfig, 'driver'> => {
          return {
            autoSchemaFile: true
          };
        }
      }),
      HealthModule,
      StatementModule,
      SymbolModule,
      SystemModule,
      UserModule
    ]
  }).overrideProvider(getRepositoryToken(StatementEntity)).useClass(MongoRepository).overrideProvider(getRepositoryToken(SymbolEntity)).useClass(MongoRepository).overrideProvider(getRepositoryToken(MongoSystemEntity)).useClass(MongoRepository).overrideProvider(getRepositoryToken(MongoUserEntity)).useClass(MongoRepository).compile();

  const app = testingModule.createNestApplication<NestExpressApplication>();

  app.set('query parser', 'extended');

  app.use(cookieParser());

  await app.init();

  return app;
};
