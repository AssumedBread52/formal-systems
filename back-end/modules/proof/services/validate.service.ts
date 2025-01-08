import { BaseValidateService } from '@/common/services/base-validate.service';
import { ProofUniqueTitleException } from '@/proof/exceptions/proof-unique-title.exception';
import { EditProofPayload } from '@/proof/payloads/edit-proof.payload';
import { NewProofPayload } from '@/proof/payloads/new-proof.payload';
import { ProofEntity } from '@/proof/proof.entity';
import { StatementReadService } from '@/statement/services/statement-read.service';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ValidateService extends BaseValidateService {
  constructor(@InjectRepository(ProofEntity) private proofRepository: MongoRepository<ProofEntity>, private statementReadService: StatementReadService) {
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

  async newProofCheck(systemId: ObjectId, statementId: ObjectId, newProofPayload: NewProofPayload): Promise<void> {
    const { steps } = newProofPayload;

    await this.proofCheck(systemId, statementId, steps);
  }

  async editProofCheck(systemId: ObjectId, statementId: ObjectId, editProofPayload: EditProofPayload): Promise<void> {
    const { newSteps } = editProofPayload;

    await this.proofCheck(systemId, statementId, newSteps);
  }

  private async proofCheck(systemId: ObjectId, statementId: ObjectId, steps: [string, [string, string[]][]][]): Promise<void> {
    const closure = [] as string[][];
    const symbolDictionary = {} as Record<string, SymbolEntity>;

    const { distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = await this.statementReadService.readById(systemId, statementId);

    for (const variableTypeHypothesis of variableTypeHypotheses) {
      const [typeSymbolId, variableSymbolId] = variableTypeHypothesis;

      closure.push([typeSymbolId.toString(), variableSymbolId.toString()]);
    }

    for (const logicalHypothesis of logicalHypotheses) {
      closure.push(logicalHypothesis.map((symbolId: ObjectId): string => {
        return symbolId.toString();
      }));
    }

    for (const step of steps) {
      const [stepStatementId, substitutionMap] = step;

      const { distinctVariableRestrictions: stepDistinctVariableRestrictions, variableTypeHypotheses: stepVariableTypeHypotheses, logicalHypotheses: stepLogicalHypotheses, assertion: stepAssertion } = await this.statementReadService.readById(systemId, stepStatementId);
    }
  }
};
