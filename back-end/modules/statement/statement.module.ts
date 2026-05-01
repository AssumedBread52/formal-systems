import { SystemModule } from '@/system/system.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementController } from './controllers/statement.controller';
import { StatementEntity } from './entities/statement.entity';
import { StatementRelationsResolver } from './resolvers/statement-relations.resolver';
import { StatementResolver } from './resolvers/statement.resolver';
import { StatementLoadingService } from './services/statement-loading.service';
import { StatementReadService } from './services/statement-read.service';

@Module({
  imports: [
    forwardRef((): typeof SystemModule => {
      return SystemModule;
    }),
    TypeOrmModule.forFeature([
      StatementEntity
    ])
  ],
  controllers: [
    StatementController
  ],
  providers: [
    StatementLoadingService,
    StatementReadService,
    StatementRelationsResolver,
    StatementResolver
  ],
  exports: [
    StatementLoadingService
  ]
})
export class StatementModule {
};
