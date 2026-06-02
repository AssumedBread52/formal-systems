import { validatePayload } from '@/common/helpers/validate-payload';
import { ExpressionReadService } from '@/expression/services/expression-read.service';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { StatementNotFoundException } from '@/statement/exceptions/statement-not-found.exception';
import { EditStatementPayload } from '@/statement/payloads/edit-statement.payload';
import { NewStatementPayload } from '@/statement/payloads/new-statement.payload';
import { SystemReadService } from '@/system/services/system-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HypothesisReadService } from './hypothesis-read.service';
import { StatementReadService } from './statement-read.service';

@Injectable()
export class StatementWriteService {
  public constructor(private readonly expressionReadService: ExpressionReadService, private readonly hypothesisReadService: HypothesisReadService, private readonly statementReadService: StatementReadService, private readonly systemReadService: SystemReadService, @InjectRepository(StatementEntity) private readonly repository: Repository<StatementEntity>) {
  }

  public async create(userId: string, systemId: string, newStatementPayload: NewStatementPayload): Promise<StatementEntity> {
    try {
      const validatedNewStatementPayload = validatePayload(newStatementPayload, NewStatementPayload);

      await this.systemReadService.verifyOwnership(userId, systemId);

      await this.statementReadService.verifyUniqueName(systemId, validatedNewStatementPayload.name);

      await this.expressionReadService.verifyExists(systemId, validatedNewStatementPayload.assertionExpressionId);

      for (const typeHypothesisExpressionId of validatedNewStatementPayload.typeHypothesesExpressionIds) {
        await this.expressionReadService.verifyExists(systemId, typeHypothesisExpressionId);
      }

      return await this.repository.manager.transaction('SERIALIZABLE', async (entityManager: EntityManager): Promise<StatementEntity> => {
        const hypothesisRepository = entityManager.getRepository(HypothesisEntity);
        const statementRepository = entityManager.getRepository(StatementEntity);

        await this.expressionReadService.verifyExpressionType(entityManager, validatedNewStatementPayload.assertionExpressionId, 'constant_prefixed');

        for (const typeHypothesisExpressionId of validatedNewStatementPayload.typeHypothesesExpressionIds) {
          await this.expressionReadService.verifyExpressionType(entityManager, typeHypothesisExpressionId, 'constant_variable_pair');
        }

        await this.hypothesisReadService.verifyUniqueVariableSymbolTypeByProposed(entityManager, validatedNewStatementPayload.typeHypothesesExpressionIds);

        await this.hypothesisReadService.verifyAllSymbolsInExpressionTypedByProposed(entityManager, validatedNewStatementPayload.typeHypothesesExpressionIds, validatedNewStatementPayload.assertionExpressionId);

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
