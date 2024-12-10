import { SessionUserDecorator } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ProofPayload } from './payloads/proof.payload';
import { ProofEntity } from './proof.entity';
import { ProofCreateService } from './services/proof-create.service';
import { ProofDeleteService } from './services/proof-delete.service';
import { ProofReadService } from './services/proof-read.service';
import { ProofUpdateService } from './services/proof-update.service';

@Controller('system/:systemId/statement/:statementId/proof')
export class ProofController {
  constructor(private proofCreateService: ProofCreateService, private proofDeleteService: ProofDeleteService, private proofReadService: ProofReadService, private proofUpdateService: ProofUpdateService) {
  }

  @UseGuards(JwtGuard)
  @Delete(':proofId')
  async deleteProof(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('statementId') statementId: string, @Param('proofId') proofId: string): Promise<ProofPayload> {
    const deletedProof = await this.proofDeleteService.delete(sessionUserId, systemId, statementId, proofId);

    return new ProofPayload(deletedProof);
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

  @UseGuards(JwtGuard)
  @Patch(':proofId')
  async patchProof(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('statementId') statementId: string, @Param('proofId') proofId: string, @Body() payload: any): Promise<ProofPayload> {
    const updatedProof = await this.proofUpdateService.update(sessionUserId, systemId, statementId, proofId, payload);

    return new ProofPayload(updatedProof);
  }

  @UseGuards(JwtGuard)
  @Post()
  async postProof(@SessionUserDecorator('_id') sessionUserId: ObjectId, @Param('systemId') systemId: string, @Param('statementId') statementId: string, @Body() payload: any): Promise<ProofPayload> {
    const createdProof = await this.proofCreateService.create(sessionUserId, systemId, statementId, payload);

    return new ProofPayload(createdProof);
  }
};
