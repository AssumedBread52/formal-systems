import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ProofPayload } from './payloads/proof.payload';
import { ProofEntity } from './proof.entity';
import { ProofDeleteService } from './services/proof-delete.service';
import { ProofReadService } from './services/proof-read.service';

@Controller('system/:systemId/statement/:statementId/proof')
export class ProofController {
  constructor(private proofDeleteService: ProofDeleteService, private proofReadService: ProofReadService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':proofId')
  async deleteProof(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('statementId') statementId: string, @Param('proofId') proofId: string): Promise<ProofPayload> {
    const proof = await this.proofDeleteService.delete(sessionUserId, systemId, statementId, proofId);

    return new ProofPayload(proof);
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
