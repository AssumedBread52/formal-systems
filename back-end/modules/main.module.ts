import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseType } from 'typeorm';
import { AppModule } from './app/app.module';
import { AuthModule } from './auth/auth.module';
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
import { SystemSymbolCountSubscriber } from './system/subscribers/system-symbol-count.subscriber';
import { SystemModule } from './system/system.module';
import { UserProofCountSubscriber } from './user/subscribers/user-proof-count.subscriber';
import { UserStatementCountSubscriber } from './user/subscribers/user-statement-count.subscriber';
import { UserSymbolCountSubscriber } from './user/subscribers/user-symbol-count.subscriber';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AppModule,
    AuthModule,
    ConfigModule.forRoot({
      cache: true,
      envFilePath: [
        '.env',
        'database-credentials.env'
      ]
    }),
    EventEmitterModule.forRoot(),
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
          SystemSymbolCountSubscriber,
          UserProofCountSubscriber,
          UserStatementCountSubscriber,
          UserSymbolCountSubscriber
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
