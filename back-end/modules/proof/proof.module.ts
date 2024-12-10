import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProofController } from './proof.controller';
import { ProofEntity } from './proof.entity';
import { ProofDeleteService } from './services/proof-delete.service';
import { ProofReadService } from './services/proof-read.service';
import { ValidateService } from './services/validate.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProofEntity
    ])
  ],
  controllers: [
    ProofController
  ],
  providers: [
    ProofDeleteService,
    ProofReadService,
    ValidateService
  ]
})
export class ProofModule {
};
