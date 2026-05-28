import { validatePayload } from '@/common/helpers/validate-payload';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionNotFoundException } from '@/expression/exceptions/expression-not-found.exception';
import { ExpressionReadService } from '@/expression/services/expression-read.service';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { InvalidExpressionLengthException } from '@/statement/exceptions/invalid-expression-length.exception';
import { StatementNotFoundException } from '@/statement/exceptions/statement-not-found.exception';
import { UniqueNameException } from '@/statement/exceptions/unique-name.exception';
import { UniqueVariableSymbolTypeException } from '@/statement/exceptions/unique-variable-symbol-type.exception';
import { VariableSymbolNotTypedException } from '@/statement/exceptions/variable-symbol-not-typed.exception';
import { EditStatementPayload } from '@/statement/payloads/edit-statement.payload';
import { NewStatementPayload } from '@/statement/payloads/new-statement.payload';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SystemReadService } from '@/system/services/system-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Raw, Repository } from 'typeorm';

@Injectable()
export class StatementWriteService {
  public constructor(private readonly expressionReadService: ExpressionReadService, private readonly symbolReadService: SymbolReadService, private readonly systemReadService: SystemReadService, @InjectRepository(StatementEntity) private readonly repository: Repository<StatementEntity>) {
  }

  public async create(userId: string, systemId: string, newStatementPayload: NewStatementPayload): Promise<StatementEntity> {
    try {
      const validatedNewStatementPayload = validatePayload(newStatementPayload, NewStatementPayload);

      await this.systemReadService.verifyOwnership(userId, systemId);

      const nameConflict = await this.repository.existsBy({
        systemId,
        name: validatedNewStatementPayload.name
      });

      if (nameConflict) {
        throw new UniqueNameException();
      }

      const assertion = await this.expressionReadService.selectById(systemId, validatedNewStatementPayload.assertionExpressionId);

      if (0 === assertion.canonical.length) {
        throw new InvalidExpressionLengthException();
      }

      return await this.repository.manager.transaction('SERIALIZABLE', async (entityManager: EntityManager): Promise<StatementEntity> => {
        const expressionRepository = entityManager.getRepository(ExpressionEntity);
        const hypothesisRepository = entityManager.getRepository(HypothesisEntity);
        const statementRepository = entityManager.getRepository(StatementEntity);

        await this.symbolReadService.verifyAllExist(systemId, [
          assertion.canonical[0]!
        ]);

        await this.symbolReadService.verifySymbolType(entityManager, systemId, [
          assertion.canonical[0]!
        ], SymbolType.constant);

        const typeExpressions = await expressionRepository.findBy({
          id: In(validatedNewStatementPayload.typeHypothesesExpressionIds),
          systemId,
          canonical: Raw((columnAlias: string): string => {
            return `cardinality(${columnAlias}) = 2`;
          })
        });

        if (typeExpressions.length !== validatedNewStatementPayload.typeHypothesesExpressionIds.length) {
          throw new ExpressionNotFoundException();
        }

        await this.symbolReadService.verifyAllExist(systemId, typeExpressions.map((typeExpression: ExpressionEntity): string => {
          return typeExpression.canonical[0]!;
        }));

        await this.symbolReadService.verifySymbolType(entityManager, systemId, typeExpressions.map((typeExpression: ExpressionEntity): string => {
          return typeExpression.canonical[0]!;
        }), SymbolType.constant);

        await this.symbolReadService.verifyAllExist(systemId, typeExpressions.map((typeExpression: ExpressionEntity): string => {
          return typeExpression.canonical[1]!;
        }));

        await this.symbolReadService.verifySymbolType(entityManager, systemId, typeExpressions.map((typeExpression: ExpressionEntity): string => {
          return typeExpression.canonical[1]!;
        }), SymbolType.variable);

        typeExpressions.forEach((typeExpression: ExpressionEntity, typeIndex: number, expressions: ExpressionEntity[]): void => {
          expressions.forEach((expression: ExpressionEntity, index: number): void => {
            if (typeExpression.canonical[1] === expression.canonical[1] && typeIndex !== index) {
              throw new UniqueVariableSymbolTypeException();
            }
          });
        });

        const variableSymbolIds = await this.symbolReadService.selectVariableSymbolIds(assertion.systemId, assertion.id);

        variableSymbolIds.forEach((variableSymbolId: string): void => {
          if (!typeExpressions.some((typeExpression: ExpressionEntity): boolean => {
            return variableSymbolId === typeExpression.canonical[1]!;
          })) {
            throw new VariableSymbolNotTypedException();
          }
        });

        const statement = new StatementEntity();

        statement.systemId = systemId;
        statement.name = validatedNewStatementPayload.name;
        statement.description = validatedNewStatementPayload.description;
        statement.assertionExpressionId = validatedNewStatementPayload.assertionExpressionId;

        const savedStatement = await statementRepository.save(statement);

        await hypothesisRepository.save(validatedNewStatementPayload.typeHypothesesExpressionIds.map((typeHypothesisExpressionId: string): HypothesisEntity => {
          const hypothesis = new HypothesisEntity();

          hypothesis.expressionId = typeHypothesisExpressionId;
          hypothesis.statementId = savedStatement.id;
          hypothesis.systemId = systemId;
          hypothesis.type = HypothesisType.type;

          return hypothesis;
        }));

        return savedStatement;
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Creating statement failed');
    }
  }

  public async delete(userId: string, systemId: string, statementId: string): Promise<StatementEntity> {
    try {
      const statement = await this.repository.findOneBy({
        id: statementId,
        systemId
      });

      if (!statement) {
        throw new StatementNotFoundException();
      }

      await this.systemReadService.verifyOwnership(userId, systemId);

      const removedStatement = await this.repository.manager.transaction('SERIALIZABLE', async (entityManager: EntityManager): Promise<StatementEntity> => {
        const statementRepository = entityManager.getRepository(StatementEntity);
        const hypothesisRepository = entityManager.getRepository(HypothesisEntity);
        const distinctVariablePairRepository = entityManager.getRepository(DistinctVariablePairEntity);

        const hypotheses = await hypothesisRepository.findBy({
          systemId,
          statementId
        });

        await hypothesisRepository.remove(hypotheses);

        const distinctVariablePairs = await distinctVariablePairRepository.findBy({
          systemId,
          statementId
        });

        await distinctVariablePairRepository.remove(distinctVariablePairs);

        return statementRepository.remove(statement);
      });

      removedStatement.id = statementId;

      return removedStatement;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Deleting statement failed');
    }
  }

  public async update(userId: string, systemId: string, statementId: string, editStatementPayload: EditStatementPayload): Promise<StatementEntity> {
    try {
      const validatedEditStatementPayload = validatePayload(editStatementPayload, EditStatementPayload);

      const statement = await this.repository.findOneBy({
        id: statementId,
        systemId
      });

      if (!statement) {
        throw new StatementNotFoundException();
      }

      await this.systemReadService.verifyOwnership(userId, systemId);

      // everything in the try block below this line still needs work
      console.log(validatedEditStatementPayload);

      return new StatementEntity();
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Updating statement failed');
    }
  }
};
