import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { HypothesisNotFoundException } from '@/statement/exceptions/hypothesis-not-found.exception';
import { TypeHypothesisInUseException } from '@/statement/exceptions/type-hypothesis-in-use.exception';
import { SystemReadService } from '@/system/services/system-read.service';
import { UserReadService } from '@/user/services/user-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class HypothesisWriteService {
  public constructor(private readonly systemReadService: SystemReadService, private readonly userReadService: UserReadService, @InjectRepository(HypothesisEntity) private readonly repository: Repository<HypothesisEntity>) {
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

      const user = await this.userReadService.selectById(userId);

      const system = await this.systemReadService.selectById(systemId);

      if (user.id !== system.ownerUserId) {
        throw new OwnershipException();
      }

      if (HypothesisType.type !== hypothesis.type) {
        const removedHypothesis = await this.repository.remove(hypothesis);

        removedHypothesis.id = hypothesisId;

        return removedHypothesis;
      }

      const removedHypothesis = await this.repository.manager.transaction('SERIALIZABLE', async (entityManager: EntityManager): Promise<HypothesisEntity> => {
        const expressionTokenRepository = entityManager.getRepository(ExpressionTokenEntity);
        const hypothesisRepository = entityManager.getRepository(HypothesisEntity);

        const inUse = await expressionTokenRepository.existsBy({
          expressionId: hypothesis.expressionId,
          systemId: hypothesis.systemId,
          position: 1,
          symbol: [
            {
              expressionTokens: {
                expression: [
                  {
                    hypotheses: {
                      systemId: hypothesis.systemId,
                      statementId: hypothesis.statementId,
                      type: HypothesisType.logic
                    }
                  },
                  {
                    statements: {
                      id: hypothesis.statementId,
                      systemId: hypothesis.systemId
                    }
                  }
                ]
              }
            },
            {
              distinctVariable1Pairs: {
                systemId: hypothesis.systemId,
                statementId: hypothesis.statementId
              }
            },
            {
              distinctVariable2Pairs: {
                systemId: hypothesis.systemId,
                statementId: hypothesis.statementId
              }
            }
          ]
        });

        if (inUse) {
          throw new TypeHypothesisInUseException();
        }

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
