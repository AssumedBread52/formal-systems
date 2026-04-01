import { AuthModule } from '@/auth/auth.module';
import { DependencyModule } from '@/dependency/dependency.module';
import { DistinctVariablePairModule } from '@/distinct-variable-pair/distinct-variable-pair.module';
import { MongoDistinctVariablePairEntity } from '@/distinct-variable-pair/entities/mongo-distinct-variable-pair.entity';
import { MongoExpressionEntity } from '@/expression/entities/mongo-expression.entity';
import { ExpressionModule } from '@/expression/expression.module';
import { HealthModule } from '@/health/health.module';
import { MongoSymbolEntity } from '@/symbol/entities/mongo-symbol.entity';
import { SymbolModule } from '@/symbol/symbol.module';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemModule } from '@/system/system.module';
import { UserEntity } from '@/user/entities/user.entity';
import { UserModule } from '@/user/user.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';
import { Request, Response } from 'express';
import { MongoRepository, Repository } from 'typeorm';

export const createTestApp = async (): Promise<NestExpressApplication> => {
  const testingModule = await Test.createTestingModule({
    imports: [
      AuthModule,
      DependencyModule,
      DistinctVariablePairModule,
      ExpressionModule,
      GraphQLModule.forRootAsync({
        driver: ApolloDriver,
        useFactory: (): Omit<ApolloDriverConfig, 'driver'> => {
          return {
            autoSchemaFile: true,
            context: (params: { req: Request; res: Response; }): { res: Response; } => {
              const { res } = params;

              return {
                res
              };
            }
          };
        }
      }),
      HealthModule,
      SymbolModule,
      SystemModule,
      UserModule
    ]
  }).overrideProvider(getRepositoryToken(MongoExpressionEntity)).useClass(MongoRepository).overrideProvider(getRepositoryToken(MongoDistinctVariablePairEntity)).useClass(MongoRepository).overrideProvider(getRepositoryToken(MongoSymbolEntity)).useClass(MongoRepository).overrideProvider(getRepositoryToken(SystemEntity)).useClass(Repository).overrideProvider(getRepositoryToken(UserEntity)).useClass(Repository).compile();

  const app = testingModule.createNestApplication<NestExpressApplication>();

  app.set('query parser', 'extended');

  app.use(cookieParser());

  await app.init();

  return app;
};
