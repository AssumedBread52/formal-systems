import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionReadService } from '@/expression/services/expression-read.service';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { HypothesisType } from '@/statement/enums/hypothesis-type.enum';
import { HypothesisNotFoundException } from '@/statement/exceptions/hypothesis-not-found.exception';
import { InvalidExpressionLengthException } from '@/statement/exceptions/invalid-expression-length.exception';
import { TypeHypothesisInUseException } from '@/statement/exceptions/type-hypothesis-in-use.exception';
import { UniqueHypothesisExpressionException } from '@/statement/exceptions/unique-hypothesis-expression.exception';
import { UniqueVariableSymbolTypeException } from '@/statement/exceptions/unique-variable-symbol-type.exception';
import { NewHypothesisPayload } from '@/statement/payloads/new-hypothesis.payload';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SystemReadService } from '@/system/services/system-read.service';
import { UserReadService } from '@/user/services/user-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, EntityManager, Repository } from 'typeorm';
import { HypothesisReadService } from './hypothesis-read.service';
import { StatementReadService } from './statement-read.service';

@Injectable()
export class HypothesisWriteService {
  public constructor(private readonly expressionReadService: ExpressionReadService, private readonly hypothesisReadService: HypothesisReadService, private readonly statementReadService: StatementReadService, private readonly symbolReadService: SymbolReadService, private readonly systemReadService: SystemReadService, private readonly userReadService: UserReadService, @InjectRepository(HypothesisEntity) private readonly repository: Repository<HypothesisEntity>) {
  }

  public async create(userId: string, systemId: string, statementId: string, newHypothesisPayload: NewHypothesisPayload): Promise<HypothesisEntity> {
    try {
      const validatedNewHypothesisPayload = validatePayload(newHypothesisPayload, NewHypothesisPayload);

      const user = await this.userReadService.selectById(userId);

      const system = await this.systemReadService.selectById(systemId);

      if (user.id !== system.ownerUserId) {
        throw new OwnershipException();
      }

      const statement = await this.statementReadService.selectById(systemId, statementId);

      const expression = await this.expressionReadService.selectById(systemId, validatedNewHypothesisPayload.expressionId);

      const expressionCollision = await this.repository.existsBy({
        systemId,
        statementId,
        expressionId: expression.id
      });

      if (expressionCollision) {
        throw new UniqueHypothesisExpressionException();
      }

      if (1 > expression.canonical.length) {
        throw new InvalidExpressionLengthException();
      }

      return await this.repository.manager.transaction('SERIALIZABLE', async (entityManager: EntityManager): Promise<HypothesisEntity> => {
        const hypothesisRepository = entityManager.getRepository(HypothesisEntity);

        await this.symbolReadService.verifyAllExist(entityManager, system.id, [
          expression.canonical[0]!
        ], SymbolType.constant);

        switch (validatedNewHypothesisPayload.type) {
          case HypothesisType.logic:
            const variableSymbolIds = await this.symbolReadService.selectVariableSymbolIds(expression.systemId, expression.id);

            await this.hypothesisReadService.verifyAllSymbolsTyped(entityManager, system.id, statement.id, variableSymbolIds);
            break;
          case HypothesisType.type:
            if (2 !== expression.canonical.length) {
              throw new InvalidExpressionLengthException();
            }

            const variableSymbolId = expression.canonical[1]!;

            await this.symbolReadService.verifyAllExist(entityManager, system.id, [
              variableSymbolId
            ], SymbolType.variable);

            const variableSymbolAlreadyTyped = await hypothesisRepository.existsBy({
              systemId,
              statementId,
              type: HypothesisType.type,
              expression: {
                canonical: ArrayContains([
                  variableSymbolId
                ])
              }
            });

            if (variableSymbolAlreadyTyped) {
              throw new UniqueVariableSymbolTypeException();
            }
            break;
        }

        const hypothesis = new HypothesisEntity();

        hypothesis.systemId = system.id;
        hypothesis.statementId = statement.id;
        hypothesis.expressionId = expression.id;
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
