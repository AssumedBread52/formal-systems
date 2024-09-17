import { AppModule } from '@/app/app.module';
import { ConfigServiceMock } from '@/app/tests/mocks/config-service.mock';
import { AuthModule } from '@/auth/auth.module';
import { HealthModule } from '@/health/health.module';
import { TypeOrmHealthIndicatorMock } from '@/health/tests/mocks/type-orm-health-indicator.mock';
import { StatementEntity } from '@/statement/statement.entity';
import { StatementModule } from '@/statement/statement.module';
import { StatementRepositoryMock } from '@/statement/tests/mocks/statement-repository.mock';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { SymbolModule } from '@/symbol/symbol.module';
import { SymbolRepositoryMock } from '@/symbol/tests/mocks/symbol-repository.mock';
import { SystemEntity } from '@/system/system.entity';
import { SystemModule } from '@/system/system.module';
import { SystemRepositoryMock } from '@/system/tests/mocks/system-repository.mock';
import { UserRepositoryMock } from '@/user/tests/mocks/user-repository.mock';
import { UserEntity } from '@/user/user.entity';
import { UserModule } from '@/user/user.module';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as cookieParser from 'cookie-parser';

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
  }).overrideProvider(ConfigService).useClass(ConfigServiceMock).overrideProvider(TypeOrmHealthIndicator).useClass(TypeOrmHealthIndicatorMock).overrideProvider(getRepositoryToken(StatementEntity)).useClass(StatementRepositoryMock).overrideProvider(getRepositoryToken(SymbolEntity)).useClass(SymbolRepositoryMock).overrideProvider(getRepositoryToken(SystemEntity)).useClass(SystemRepositoryMock).overrideProvider(getRepositoryToken(UserEntity)).useClass(UserRepositoryMock).compile();

  const app = testingModule.createNestApplication();

  app.use(cookieParser());

  await app.init();

  return app;
};
