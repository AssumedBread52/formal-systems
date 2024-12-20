import { AppModule } from '@/app/app.module';
import { AuthModule } from '@/auth/auth.module';
import { HealthModule } from '@/health/health.module';
import { StatementEntity } from '@/statement/statement.entity';
import { StatementModule } from '@/statement/statement.module';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SymbolModule } from '@/symbol/symbol.module';
import { SystemEntity } from '@/system/system.entity';
import { SystemModule } from '@/system/system.module';
import { UserEntity } from '@/user/user.entity';
import { UserModule } from '@/user/user.module';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';
import { MongoRepository } from 'typeorm';

export const createTestApp = async (): Promise<INestApplication> => {
  const testingModule = await Test.createTestingModule({
    imports: [
      AppModule,
      AuthModule,
      HealthModule,
      StatementModule,
      SymbolModule,
      SystemModule,
      UserModule
    ]
  }).overrideProvider(getRepositoryToken(StatementEntity)).useClass(MongoRepository).overrideProvider(getRepositoryToken(SymbolEntity)).useClass(MongoRepository).overrideProvider(getRepositoryToken(SystemEntity)).useClass(MongoRepository).overrideProvider(getRepositoryToken(UserEntity)).useClass(MongoRepository).compile();

  const app = testingModule.createNestApplication();

  app.use(cookieParser());

  await app.init();

  return app;
};
