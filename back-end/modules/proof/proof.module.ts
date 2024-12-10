import { Module } from '@nestjs/common';
import { ProofController } from './proof.controller';

@Module({
  controllers: [
    ProofController
  ]
})
export class ProofModule {
};
