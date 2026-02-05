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
import { HealthModule } from './health/health.module';
import { ProofModule } from './proof/proof.module';
import { StatementModule } from './statement/statement.module';
import { StatementProofAppearanceCountSubscriber } from './statement/subscribers/statement-proof-appearance-count.subscriber';
import { StatementProofCountSubscriber } from './statement/subscribers/statement-proof-count.subscriber';
import { SymbolProofCountSubscriber } from './symbol/subscribers/symbol-proof-count.subscriber';
import { SymbolStatementCountSubscriber } from './symbol/subscribers/symbol-statement-count.subscriber';
import { SymbolModule } from './symbol/symbol.module';
import { SystemProofCountSubscriber } from './system/subscribers/system-proof-count.subscriber';
import { SystemStatementCountSubscriber } from './system/subscribers/system-statement-count.subscriber';
import { SystemModule } from './system/system.module';
import { UserProofCountSubscriber } from './user/subscribers/user-proof-count.subscriber';
import { UserStatementCountSubscriber } from './user/subscribers/user-statement-count.subscriber';
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
    EventEmitterModule.forRoot(),
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
    ProofModule,
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

        const type = configService.getOrThrow<DatabaseType>('DATABASE_TYPE');

        const scheme = configService.getOrThrow<string>('DATABASE_SCHEME');
        const username = configService.getOrThrow<string>('DATABASE_USERNAME');
        const password = configService.getOrThrow<string>('DATABASE_PASSWORD');
        const host = configService.getOrThrow<string>('DATABASE_HOST');
        const port = configService.getOrThrow<number>('DATABASE_PORT');
        const name = configService.getOrThrow<string>('DATABASE_NAME');
        const url = `${scheme}://${username}:${encodeURIComponent(password)}@${host}:${port}/${name}?authSource=admin`;

        const subscribers = [
          StatementProofAppearanceCountSubscriber,
          StatementProofCountSubscriber,
          SymbolProofCountSubscriber,
          SymbolStatementCountSubscriber,
          SystemProofCountSubscriber,
          SystemStatementCountSubscriber,
          UserProofCountSubscriber,
          UserStatementCountSubscriber
        ];

        return {
          autoLoadEntities,
          subscribers,
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
