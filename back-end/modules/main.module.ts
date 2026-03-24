import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { DatabaseType } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { DependencyModule } from './dependency/dependency.module';
import { DistinctVariablePairModule } from './distinct-variable-pair/distinct-variable-pair.module';
import { ExpressionModule } from './expression/expression.module';
import { HealthModule } from './health/health.module';
import { MigrationModule } from './migration/migration.module';
import { SymbolModule } from './symbol/symbol.module';
import { SystemModule } from './system/system.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      cache: true,
      envFilePath: [
        '.env',
        'database-credentials.env'
      ]
    }),
    DependencyModule,
    DistinctVariablePairModule,
    EventEmitterModule.forRoot(),
    ExpressionModule,
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      useFactory: (): Omit<ApolloDriverConfig, 'driver'> => {
        return {
          autoSchemaFile: './modules/schema.gql',
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
          type,
          url
        };
      }
    }),
    UserModule
  ]
})
export class MainModule {
};
