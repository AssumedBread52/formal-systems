import { SystemModule } from '@/system/system.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementController } from './statement.controller';
import { StatementEntity } from './statement.entity';
import { StatementService } from './statement.service';

@Module({
  imports: [
    SystemModule,
    TypeOrmModule.forFeature([
      StatementEntity
    ])
  ],
  controllers: [
    StatementController
  ],
  providers: [
    StatementService
  ]
})
export class StatementModule {
};
