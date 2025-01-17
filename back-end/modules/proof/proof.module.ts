import { StatementModule } from '@/statement/statement.module';
import { SymbolModule } from '@/symbol/symbol.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProofController } from './proof.controller';
import { ProofEntity } from './proof.entity';
import { ProofCreateService } from './services/proof-create.service';
import { ProofDeleteService } from './services/proof-delete.service';
import { ProofReadService } from './services/proof-read.service';
import { ProofUpdateService } from './services/proof-update.service';
import { ValidateService } from './services/validate.service';

@Module({
  imports: [
    StatementModule,
    SymbolModule,
    TypeOrmModule.forFeature([
      ProofEntity
    ])
  ],
  controllers: [
    ProofController
  ],
  providers: [
    ProofCreateService,
    ProofDeleteService,
    ProofReadService,
    ProofUpdateService,
    ValidateService
  ]
})
export class ProofModule {
};
