import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseType } from 'typeorm';
import { AppModule } from './app/app.module';
import { AuthModule } from './auth/auth.module';
import { GroupingModule } from './grouping/grouping.module';
import { CleanUpSystemGroupingsSubscriber } from './grouping/subscribers/clean-up-system-groupings.subscriber';
import { StatementModule } from './statement/statement.module';
import { CleanUpSystemStatementsSubscriber } from './statement/subscribers/clean-up-system-statements.subscriber';
import { CleanUpSystemSymbolsSubscriber } from './symbol/subscribers/clean-up-system-symbols.subscriber';
import { SymbolModule } from './symbol/symbol.module';
import { SystemSymbolCountSubscriber } from './system/subscribers/system-symbol-count.subscriber';
import { SystemModule } from './system/system.module';
import { UserSymbolCountSubscriber } from './user/subscribers/user-symbol-count.subscriber';
import { UserSystemCountSubscriber } from './user/subscribers/user-system-count.subscriber';
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
    GroupingModule,
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
          CleanUpSystemGroupingsSubscriber,
          CleanUpSystemStatementsSubscriber,
          CleanUpSystemSymbolsSubscriber,
          SystemSymbolCountSubscriber,
          UserSymbolCountSubscriber,
          UserSystemCountSubscriber
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
