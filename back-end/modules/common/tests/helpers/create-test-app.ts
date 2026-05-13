import { AuthModule } from '@/auth/auth.module';
import { DependencyModule } from '@/dependency/dependency.module';
import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionModule } from '@/expression/expression.module';
import { HealthModule } from '@/health/health.module';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { StatementModule } from '@/statement/statement.module';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
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
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';

export const createTestApp = async (): Promise<NestExpressApplication> => {
  const testingModule = await Test.createTestingModule({
    imports: [
      AuthModule,
      DependencyModule,
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
      StatementModule,
      SymbolModule,
      SystemModule,
      UserModule
    ]
  }).overrideProvider(getRepositoryToken(DistinctVariablePairEntity)).useClass(Repository).overrideProvider(getRepositoryToken(ExpressionEntity)).useClass(Repository).overrideProvider(getRepositoryToken(ExpressionTokenEntity)).useClass(Repository).overrideProvider(getRepositoryToken(HypothesisEntity)).useClass(Repository).overrideProvider(getRepositoryToken(StatementEntity)).useClass(Repository).overrideProvider(getRepositoryToken(SymbolEntity)).useClass(Repository).overrideProvider(getRepositoryToken(SystemEntity)).useClass(Repository).overrideProvider(getRepositoryToken(UserEntity)).useClass(Repository).compile();

  const app = testingModule.createNestApplication<NestExpressApplication>();

  app.set('query parser', 'extended');

  app.use(cookieParser());

  await app.init();

  return app;
};
