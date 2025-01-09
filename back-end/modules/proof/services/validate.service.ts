import { BaseValidateService } from '@/common/services/base-validate.service';
import { InvalidSubstitutionException } from '@/proof/exceptions/invalid-substitution.exception';
import { MissingSubstitutionException } from '@/proof/exceptions/missing-substitution.exception';
import { ProofUniqueTitleException } from '@/proof/exceptions/proof-unique-title.exception';
import { EditProofPayload } from '@/proof/payloads/edit-proof.payload';
import { NewProofPayload } from '@/proof/payloads/new-proof.payload';
import { ProofEntity } from '@/proof/proof.entity';
import { StatementReadService } from '@/statement/services/statement-read.service';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';

@Injectable()
export class ValidateService extends BaseValidateService {
  constructor(@InjectRepository(ProofEntity) private proofRepository: MongoRepository<ProofEntity>, private statementReadService: StatementReadService, private symbolReadService: SymbolReadService) {
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
      const [stepStatementId, substitutions] = step;

      const { distinctVariableRestrictions: stepDistinctVariableRestrictions, variableTypeHypotheses: stepVariableTypeHypotheses, logicalHypotheses: stepLogicalHypotheses, assertion: stepAssertion } = await this.statementReadService.readById(systemId, stepStatementId);

      const substitutionMap = {} as Record<string, string[]>;
      for (const substitution of substitutions) {
        const [variableSymbolId, expression] = substitution;

        const missingSubstitutionSymbols = await this.symbolReadService.addToSymbolDictionary(systemId, [variableSymbolId].concat(expression).map((symbolId: string): ObjectId => {
          return new ObjectId(symbolId);
        }), symbolDictionary);

        for (const symbolId in missingSubstitutionSymbols) {
          symbolDictionary[symbolId] = missingSubstitutionSymbols[symbolId];
        }

        if (SymbolType.Variable !== symbolDictionary[variableSymbolId].type) {
          throw new InvalidSubstitutionException();
        }

        substitutionMap[variableSymbolId] = expression;
      }

      for (const stepVariableTypeHypothesis of stepVariableTypeHypotheses) {
        const [, variableSymbolId] = stepVariableTypeHypothesis;

        if (!substitutionMap[variableSymbolId.toString()]) {
          throw new MissingSubstitutionException();
        }
      }
    }
  }
};
