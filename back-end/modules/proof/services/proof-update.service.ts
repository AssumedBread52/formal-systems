import { ProofEntity } from '@/proof/proof.entity';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ProofUpdateService {
  async update(sessionUserId: ObjectId, systemId: any, statementId: any, proofId: any, payload: any): Promise<ProofEntity> {
    console.log(sessionUserId, systemId, statementId, proofId, payload);

    return new ProofEntity();
  }
};
