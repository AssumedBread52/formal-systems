import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseType } from 'typeorm';
import { AppModule } from './app/app.module';
import { AuthModule } from './auth/auth.module';
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
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule
      ],
      inject: [
        ConfigService
      ],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const autoLoadEntities = true;

        const type = configService.get<DatabaseType>('DATABASE_TYPE');

        const scheme = configService.get<string>('DATABASE_SCHEME');
        const username = configService.get<string>('DATABASE_USERNAME');
        const password = configService.get<string>('DATABASE_PASSWORD');
        const host = configService.get<string>('DATABASE_HOST');
        const port = configService.get<number>('DATABASE_PORT');
        const name = configService.get<string>('DATABASE_NAME');
        const url = `${scheme}://${username}:${encodeURIComponent(password ?? '')}@${host}:${port}/${name}?authSource=admin`;

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
