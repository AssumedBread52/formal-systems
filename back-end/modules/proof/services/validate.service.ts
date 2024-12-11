import { BaseValidateService } from '@/common/services/base-validate.service';
import { ProofUniqueTitleException } from '@/proof/exceptions/proof-unique-title.exception';
import { EditProofPayload } from '@/proof/payloads/edit-proof.payload';
import { NewProofPayload } from '@/proof/payloads/new-proof.payload';
import { ProofEntity } from '@/proof/proof.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ValidateService extends BaseValidateService {
  constructor(@InjectRepository(ProofEntity) private proofRepository: MongoRepository<ProofEntity>) {
    super();
  }

  async conflictCheck(title: string, systemId: ObjectId, statementId: ObjectId): Promise<void> {
    const collision = await this.proofRepository.findOneBy({
      title,
      statementId,
      systemId
    });

    if (collision) {
      throw new ProofUniqueTitleException();
    }
  }

  async newProofCheck(statementId: ObjectId, newProofPayload: NewProofPayload): Promise<void> {
    const { steps } = newProofPayload;

    await this.proofCheck(statementId, steps);
  }

  async editProofCheck(statementId: ObjectId, editProofPayload: EditProofPayload): Promise<void> {
    const { newSteps } = editProofPayload;

    await this.proofCheck(statementId, newSteps);
  }

  async proofCheck(statementId: ObjectId, steps: [string, [string, string[]][]][]): Promise<void> {
    console.log(statementId, steps);
  }
};
