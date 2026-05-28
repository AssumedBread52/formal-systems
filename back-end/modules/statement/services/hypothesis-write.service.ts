import { validatePayload } from '@/common/helpers/validate-payload';
import { ExpressionReadService } from '@/expression/services/expression-read.service';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { HypothesisNotFoundException } from '@/statement/exceptions/hypothesis-not-found.exception';
import { NewHypothesisPayload } from '@/statement/payloads/new-hypothesis.payload';
import { SystemReadService } from '@/system/services/system-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HypothesisReadService } from './hypothesis-read.service';
import { StatementReadService } from './statement-read.service';

@Injectable()
export class HypothesisWriteService {
  public constructor(private readonly expressionReadService: ExpressionReadService, private readonly hypothesisReadService: HypothesisReadService, private readonly statementReadService: StatementReadService, private readonly systemReadService: SystemReadService, @InjectRepository(HypothesisEntity) private readonly repository: Repository<HypothesisEntity>) {
  }

  public async create(userId: string, systemId: string, statementId: string, newHypothesisPayload: NewHypothesisPayload): Promise<HypothesisEntity> {
    try {
      const validatedNewHypothesisPayload = validatePayload(newHypothesisPayload, NewHypothesisPayload);

      await this.systemReadService.verifyOwnership(userId, systemId);

      await this.statementReadService.verifyExists(systemId, statementId);

      await this.expressionReadService.verifyExists(systemId, validatedNewHypothesisPayload.expressionId);

      await this.hypothesisReadService.verifyUniqueHypothesisExpression(statementId, validatedNewHypothesisPayload.expressionId);

      return await this.repository.manager.transaction('SERIALIZABLE', async (entityManager: EntityManager): Promise<HypothesisEntity> => {
        const hypothesisRepository = entityManager.getRepository(HypothesisEntity);

        switch (validatedNewHypothesisPayload.type) {
          case HypothesisType.logic:
            await this.expressionReadService.verifyExpressionType(entityManager, validatedNewHypothesisPayload.expressionId, 'constant_prefixed');

            await this.hypothesisReadService.verifyAllSymbolsInExpressionTyped(entityManager, statementId, validatedNewHypothesisPayload.expressionId);
            break;
          case HypothesisType.type:
            await this.expressionReadService.verifyExpressionType(entityManager, validatedNewHypothesisPayload.expressionId, 'constant_variable_pair');

            await this.hypothesisReadService.verifyUniqueVariableSymbolType(entityManager, statementId, validatedNewHypothesisPayload.expressionId);
            break;
        }

        const hypothesis = new HypothesisEntity();

        hypothesis.systemId = systemId;
        hypothesis.statementId = statementId;
        hypothesis.expressionId = validatedNewHypothesisPayload.expressionId;
        hypothesis.type = validatedNewHypothesisPayload.type;

        return await hypothesisRepository.save(hypothesis);
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Create hypothesis failed');
    }
  }

  public async delete(userId: string, systemId: string, statementId: string, hypothesisId: string): Promise<HypothesisEntity> {
    try {
      const hypothesis = await this.repository.findOneBy({
        id: hypothesisId,
        systemId,
        statementId
      });

      if (!hypothesis) {
        throw new HypothesisNotFoundException();
      }

      await this.systemReadService.verifyOwnership(userId, systemId);

      if (HypothesisType.type !== hypothesis.type) {
        const removedHypothesis = await this.repository.remove(hypothesis);

        removedHypothesis.id = hypothesisId;

        return removedHypothesis;
      }

      const removedHypothesis = await this.repository.manager.transaction('SERIALIZABLE', async (entityManager: EntityManager): Promise<HypothesisEntity> => {
        const hypothesisRepository = entityManager.getRepository(HypothesisEntity);

        await this.hypothesisReadService.verifyTypeHypothesisNotInUse(entityManager, statementId, hypothesisId);

        return await hypothesisRepository.remove(hypothesis);
      });

      removedHypothesis.id = hypothesisId;

      return removedHypothesis;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Deleting hypothesis failed');
    }
  }
};
