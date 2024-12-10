import { ProofEntity } from '@/proof/proof.entity';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ProofCreateService {
  async create(sessionUserId: ObjectId, systemId: any, statementId: any, payload: any): Promise<ProofEntity> {
    console.log(sessionUserId, systemId, statementId, payload);

    return new ProofEntity();
  }
};
