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

    const { title, description, steps } = newProofPayload;

    await this.validateService.conflictCheck(title, systemId, _id);

    await this.validateService.newProofCheck(_id, newProofPayload);

    const proof = new ProofEntity();

    proof.title = title;
    proof.description = description;
    proof.steps = steps.map((step: [string, [string, string[]][]]): [ObjectId, [ObjectId, ObjectId[]][]] => {
      const [statementId, substitutions] = step;

      return [
        new ObjectId(statementId),
        substitutions.map((substitution: [string, string[]]): [ObjectId, ObjectId[]] => {
          const [variableSymbolId, expression] = substitution;

          return [
            new ObjectId(variableSymbolId),
            expression.map((symbolId: string): ObjectId => {
              return new ObjectId(symbolId);
            })
          ];
        })
      ];
    });
    proof.statementId = _id;
    proof.systemId = systemId;
    proof.createdByUserId = sessionUserId;

    return this.proofRepository.save(proof);
  }
};
