import { BaseValidateService } from '@/common/services/base-validate.service';
import { DistinctVariableRestrictionViolationException } from '@/proof/exceptions/distinct-variable-restriction-violation.exception';
import { IncorrectSubstitutionCountException } from '@/proof/exceptions/incorrect-substitution-count.exception';
import { InvalidSubstitutionException } from '@/proof/exceptions/invalid-substitution.exception';
import { MissingLogicalHypothesisException } from '@/proof/exceptions/missing-logical-hypothesis.exception';
import { MissingSubstitutionException } from '@/proof/exceptions/missing-substitution.exception';
import { MissingVariableTypeHypothesisException } from '@/proof/exceptions/missing-variable-type-hypothesis.exception';
import { ProofUniqueTitleException } from '@/proof/exceptions/proof-unique-title.exception';
import { EditProofPayload } from '@/proof/payloads/edit-proof.payload';
import { NewProofPayload } from '@/proof/payloads/new-proof.payload';
import { ProofEntity } from '@/proof/proof.entity';
import { StatementReadService } from '@/statement/services/statement-read.service';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
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

    const { distinctVariableRestrictions, variableTypeHypotheses, logicalHypotheses, assertion } = await this.statementReadService.readById(systemId, statementId);

    const symbolDictionary = await this.symbolReadService.addToSymbolDictionary(systemId, assertion.concat(...logicalHypotheses, ...variableTypeHypotheses, ...distinctVariableRestrictions), {});

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

      const missingStepSymbols = await this.symbolReadService.addToSymbolDictionary(systemId, stepAssertion.concat(...stepLogicalHypotheses, ...stepVariableTypeHypotheses, ...stepDistinctVariableRestrictions), symbolDictionary);
      for (const missingStepSymbol in missingStepSymbols) {
        symbolDictionary[missingStepSymbol] = missingStepSymbols[missingStepSymbol];
      }

      if (substitutions.length !== stepVariableTypeHypotheses.length) {
        throw new IncorrectSubstitutionCountException();
      }

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

      for (const stepDistinctVariableRestriction of stepDistinctVariableRestrictions) {
        const [firstSymbolId, secondSymbolId] = stepDistinctVariableRestriction;

        const firstExpression = substitutionMap[firstSymbolId.toString()];
        const secondExpression = substitutionMap[secondSymbolId.toString()];

        for (const firstSymbolId of firstExpression) {
          if (SymbolType.Variable !== symbolDictionary[firstSymbolId].type) {
            continue;
          }

          for (const secondSymbolId of secondExpression) {
            if (SymbolType.Variable !== symbolDictionary[secondSymbolId].type) {
              continue;
            }

            if (-1 === distinctVariableRestrictions.findIndex((distinctVariableRestriction: [ObjectId, ObjectId]): boolean => {
              const [firstId, secondId] = distinctVariableRestriction;

              return (firstSymbolId === firstId.toString() && secondSymbolId === secondId.toString()) || (firstSymbolId === secondId.toString() && secondSymbolId === firstId.toString());
            })) {
              throw new DistinctVariableRestrictionViolationException();
            }
          }
        }
      }

      for (const stepVariableTypeHypothesis of stepVariableTypeHypotheses) {
        const newExpression = [] as string[];

        for (const symbolId of stepVariableTypeHypothesis) {
          const currentSymbolId = symbolId.toString();

          if (SymbolType.Variable !== symbolDictionary[currentSymbolId].type) {
            newExpression.push(currentSymbolId);

            continue;
          }

          newExpression.push(...substitutionMap[currentSymbolId]);
        }

        if (-1 === closure.findIndex((expression: string[]): boolean => {
          if (newExpression.length !== expression.length) {
            return false;
          }

          return expression.reduce((isMatching: boolean, symbolId: string, currentIndex: number): boolean => {
            return isMatching && symbolId === newExpression[currentIndex];
          }, true);
        })) {
          throw new MissingVariableTypeHypothesisException();
        }
      }

      for (const stepLogicalHypothesis of stepLogicalHypotheses) {
        const newExpression = [] as string[];

        for (const symbolId of stepLogicalHypothesis) {
          const currentSymbolId = symbolId.toString();

          if (SymbolType.Variable !== symbolDictionary[currentSymbolId].type) {
            newExpression.push(currentSymbolId);

            continue;
          }

          newExpression.push(...substitutionMap[currentSymbolId]);
        }

        if (-1 === closure.findIndex((expression: string[]): boolean => {
          if (newExpression.length !== expression.length) {
            return false;
          }

          return expression.reduce((isMatching: boolean, symbolId: string, currentIndex: number): boolean => {
            return isMatching && symbolId === newExpression[currentIndex];
          }, true);
        })) {
          throw new MissingLogicalHypothesisException();
        }
      }
    }
  }
};
