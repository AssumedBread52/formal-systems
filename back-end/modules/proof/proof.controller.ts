import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProofPayload } from './payloads/proof.payload';
import { ProofEntity } from './proof.entity';
import { ProofReadService } from './services/proof-read.service';

@Controller('system/:systemId/statement/:statementId/proof')
export class ProofController {
  constructor(private proofReadService: ProofReadService) {
  }

  @Get()
  async getProofs(@Param('systemId') systemId: string, @Param('statementId') statementId: string, @Query() payload: any): Promise<PaginatedResultsPayload<ProofEntity, ProofPayload>> {
    const [results, total] = await this.proofReadService.readProofs(systemId, statementId, payload);

    return new PaginatedResultsPayload(ProofPayload, results, total);
  }

  @Get(':proofId')
  async getById(@Param('systemId') systemId: string, @Param('statementId') statementId: string, @Param('proofId') proofId: string): Promise<ProofPayload> {
    const proof = await this.proofReadService.readById(systemId, statementId, proofId);

    return new ProofPayload(proof);
  }
};
