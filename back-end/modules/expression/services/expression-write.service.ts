import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { ExpressionTokenEntity } from '@/expression/entities/expression-token.entity';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { UniqueSymbolSequenceException } from '@/expression/exceptions/unique-symbol-sequence.exception';
import { NewExpressionPayload } from '@/expression/payloads/new-expression.payload';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SystemReadService } from '@/system/services/system-read.service';
import { UserReadService } from '@/user/services/user-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ExpressionWriteService {
  public constructor(private readonly symbolReadService: SymbolReadService, private readonly systemReadService: SystemReadService, private readonly userReadService: UserReadService, @InjectRepository(ExpressionEntity) private readonly repository: Repository<ExpressionEntity>) {
  }

  public async create(userId: string, systemId: string, newExpressionPayload: NewExpressionPayload): Promise<ExpressionEntity> {
    try {
      const validatedNewExpressionPayload = validatePayload(newExpressionPayload, NewExpressionPayload);

      const user = await this.userReadService.selectById(userId);

      const system = await this.systemReadService.selectById(systemId);

      if (user.id !== system.ownerUserId) {
        throw new OwnershipException();
      }

      await this.symbolReadService.verifyAllExist(systemId, validatedNewExpressionPayload.canonical);

      // TypeORM limitation: array columns, in the FindOptionsWhere type, are
      // typed as the element of the array, however, the underlying pg driver
      // correctly constructs the desired query
      const symbolSequenceConflict = await this.repository.existsBy({
        systemId,
        canonical: validatedNewExpressionPayload.canonical as any
      });

      if (symbolSequenceConflict) {
        throw new UniqueSymbolSequenceException();
      }

      const expression = new ExpressionEntity();

      expression.systemId = system.id;
      expression.canonical = validatedNewExpressionPayload.canonical;

      return await this.repository.manager.transaction('SERIALIZABLE', async (entityManager: EntityManager): Promise<ExpressionEntity> => {
        const expressionRepository = entityManager.getRepository(ExpressionEntity);
        const expressionTokenRepository = entityManager.getRepository(ExpressionTokenEntity);

        const savedExpression = await expressionRepository.save(expression);

        const expressionTokens = validatedNewExpressionPayload.canonical.map((symbolId: string, position: number): ExpressionTokenEntity => {
          const expressionToken = new ExpressionTokenEntity();

          expressionToken.systemId = system.id;
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
};
