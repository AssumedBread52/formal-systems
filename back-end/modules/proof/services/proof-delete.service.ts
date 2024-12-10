import { ProofEntity } from '@/proof/proof.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ProofReadService } from './proof-read.service';
import { ObjectId } from 'mongodb';
import { OwnershipException } from '@/auth/exceptions/ownership.exception';

@Injectable()
export class ProofDeleteService {
  constructor(@InjectRepository(ProofEntity) private proofRepository: MongoRepository<ProofEntity>, private proofReadService: ProofReadService) {
  }

  async delete(sessionUserId: ObjectId, systemId: any, statementId: any, proofId: any): Promise<ProofEntity> {
    const proof = await this.proofReadService.readById(systemId, statementId, proofId);

    const { _id, createdByUserId } = proof;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    await this.proofRepository.remove(proof);

    proof._id = _id;

    return proof;
  }
};
