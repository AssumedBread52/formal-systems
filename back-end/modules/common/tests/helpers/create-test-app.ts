import { AuthModule } from '@/auth/auth.module';
import { CommonModule } from '@/common/common.module';
import { DependencyModule } from '@/dependency/dependency.module';
import { ExpressionModule } from '@/expression/expression.module';
import { HealthModule } from '@/health/health.module';
import { MigrationModule } from '@/migration/migration.module';
import migrations from '@/migration/migrations';
import { StatementModule } from '@/statement/statement.module';
import { SymbolModule } from '@/symbol/symbol.module';
import { SystemModule } from '@/system/system.module';
import { UserModule } from '@/user/user.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';
import { DatabaseType } from 'typeorm';

export const createTestApp = async (): Promise<NestExpressApplication> => {
  const testingModule = await Test.createTestingModule({
    imports: [
      AuthModule,
      CommonModule,
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
      MigrationModule,
      StatementModule,
      SymbolModule,
      SystemModule,
      TypeOrmModule.forRootAsync({
        imports: [
          ConfigModule
        ],
        inject: [
          ConfigService
        ],
        useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
          const autoLoadEntities = true;

          const logging = true;

          const type = configService.getOrThrow<DatabaseType>('DATABASE_TYPE');

          const scheme = configService.getOrThrow<string>('DATABASE_SCHEME');
          const username = configService.getOrThrow<string>('DATABASE_USERNAME');
          const password = configService.getOrThrow<string>('DATABASE_PASSWORD');
          const host = configService.getOrThrow<string>('DATABASE_HOST');
          const port = configService.getOrThrow<number>('DATABASE_PORT');
          const name = configService.getOrThrow<string>('DATABASE_NAME');
          const url = `${scheme}://${username}:${encodeURIComponent(password)}@${host}:${port}/${name}`;

          return {
            autoLoadEntities,
            logging,
            migrations,
            type,
            url
          };
        }
      }),
      UserModule
    ]
  }).compile();

  const app = testingModule.createNestApplication<NestExpressApplication>();

  app.set('query parser', 'extended');

  app.use(cookieParser());

  await app.init();

  return app;
};
