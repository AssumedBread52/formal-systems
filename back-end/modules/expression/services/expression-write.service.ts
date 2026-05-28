import { validatePayload } from '@/common/helpers/validate-payload';
import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionNotFoundException } from '@/expression/exceptions/expression-not-found.exception';
import { NewExpressionPayload } from '@/expression/payloads/new-expression.payload';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SystemReadService } from '@/system/services/system-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ExpressionReadService } from './expression-read.service';

@Injectable()
export class ExpressionWriteService {
  public constructor(private readonly expressionReadService: ExpressionReadService, private readonly symbolReadService: SymbolReadService, private readonly systemReadService: SystemReadService, @InjectRepository(ExpressionEntity) private readonly repository: Repository<ExpressionEntity>) {
  }

  public async create(userId: string, systemId: string, newExpressionPayload: NewExpressionPayload): Promise<ExpressionEntity> {
    try {
      const validatedNewExpressionPayload = validatePayload(newExpressionPayload, NewExpressionPayload);

      await this.systemReadService.verifyOwnership(userId, systemId);

      await this.expressionReadService.verifyUniqueSymbolSequence(systemId, validatedNewExpressionPayload.canonical);

      await this.symbolReadService.verifyAllExist(systemId, validatedNewExpressionPayload.canonical);

      return await this.repository.manager.transaction('SERIALIZABLE', async (entityManager: EntityManager): Promise<ExpressionEntity> => {
        const expressionRepository = entityManager.getRepository(ExpressionEntity);
        const expressionTokenRepository = entityManager.getRepository(ExpressionTokenEntity);

        const expression = new ExpressionEntity();

        expression.systemId = systemId;
        expression.canonical = validatedNewExpressionPayload.canonical;

        const savedExpression = await expressionRepository.save(expression);

        const expressionTokens = validatedNewExpressionPayload.canonical.map((symbolId: string, position: number): ExpressionTokenEntity => {
          const expressionToken = new ExpressionTokenEntity();

          expressionToken.systemId = systemId;
          expressionToken.symbolId = symbolId;
          expressionToken.expressionId = savedExpression.id;
          expressionToken.position = position;

          return expressionToken;
        });

        await expressionTokenRepository.save(expressionTokens);

        return savedExpression;
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Creating expression failed');
    }
  }

  public async delete(userId: string, systemId: string, expressionId: string): Promise<ExpressionEntity> {
    try {
      const expression = await this.repository.findOneBy({
        id: expressionId,
        systemId
      });

      if (!expression) {
        throw new ExpressionNotFoundException();
      }

      await this.systemReadService.verifyOwnership(userId, systemId);

      await this.expressionReadService.verifyExpressionNotInUse(expressionId);

      const removedExpression = await this.repository.manager.transaction('SERIALIZABLE', async (entityManager: EntityManager): Promise<ExpressionEntity> => {
        const expressionRepository = entityManager.getRepository(ExpressionEntity);
        const expressionTokenRepository = entityManager.getRepository(ExpressionTokenEntity);

        const expressionTokens = await expressionTokenRepository.findBy({
          systemId,
          expressionId
        });

        await expressionTokenRepository.remove(expressionTokens);

        return expressionRepository.remove(expression);
      });

      removedExpression.id = expressionId;

      return removedExpression;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Deleting expression failed');
    }
  }
};
