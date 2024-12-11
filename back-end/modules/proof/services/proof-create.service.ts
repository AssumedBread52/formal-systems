import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { NewProofPayload } from '@/proof/payloads/new-proof.payload';
import { ProofEntity } from '@/proof/proof.entity';
import { StatementReadService } from '@/statement/services/statement-read.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { ValidateService } from './validate.service';

@Injectable()
export class ProofCreateService {
  constructor(@InjectRepository(ProofEntity) private proofRepository: MongoRepository<ProofEntity>, private statementReadService: StatementReadService, private validateService: ValidateService) {
  }

  async create(sessionUserId: ObjectId, containingSystemId: any, statementId: any, payload: any): Promise<ProofEntity> {
    const { _id, systemId, createdByUserId } = await this.statementReadService.readById(containingSystemId, statementId);

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const newProofPayload = this.validateService.payloadCheck(payload, NewProofPayload);

    const { title, description } = newProofPayload;

    await this.validateService.conflictCheck(title, systemId, _id);

    const proof = new ProofEntity();

    proof.title = title;
    proof.description = description;
    proof.statementId = _id;
    proof.systemId = systemId;
    proof.createdByUserId = sessionUserId;

    return this.proofRepository.save(proof);
  }
};
