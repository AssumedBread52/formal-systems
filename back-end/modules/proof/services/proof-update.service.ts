import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { EditProofPayload } from '@/proof/payloads/edit-proof.payload';
import { ProofEntity } from '@/proof/proof.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { ProofReadService } from './proof-read.service';
import { ValidateService } from './validate.service';

@Injectable()
export class ProofUpdateService {
  constructor(@InjectRepository(ProofEntity) private proofRepository: MongoRepository<ProofEntity>, private proofReadService: ProofReadService, private validateService: ValidateService) {
  }

  async update(sessionUserId: ObjectId, containingSystemId: any, containingStatementId: any, proofId: any, payload: any): Promise<ProofEntity> {
    const proof = await this.proofReadService.readById(containingSystemId, containingStatementId, proofId);

    const { title, statementId, systemId, createdByUserId } = proof;

    if (createdByUserId.toString() !== sessionUserId.toString()) {
      throw new OwnershipException();
    }

    const editProofPayload = this.validateService.payloadCheck(payload, EditProofPayload);

    const { newTitle, newDescription, newSteps } = editProofPayload;

    if (title !== newTitle) {
      await this.validateService.conflictCheck(newTitle, systemId, statementId);
    }

    await this.validateService.editProofCheck(systemId, statementId, editProofPayload);

    proof.title = newTitle;
    proof.description = newDescription;
    proof.steps = newSteps.map((newStep: [string, [string, string[]][]]): [ObjectId, [ObjectId, ObjectId[]][]] => {
      const [newStatementId, newSubstitutions] = newStep;

      return [
        new ObjectId(newStatementId),
        newSubstitutions.map((newSubstitution: [string, string[]]): [ObjectId, ObjectId[]] => {
          const [newVariableSymbolId, newExpression] = newSubstitution;

          return [
            new ObjectId(newVariableSymbolId),
            newExpression.map((newSymbolId: string): ObjectId => {
              return new ObjectId(newSymbolId);
            })
          ];
        })
      ];
    });

    return this.proofRepository.save(proof);
  }
};
