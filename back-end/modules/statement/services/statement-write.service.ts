import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { HypothesisEntity } from '@/statement/entities/hypothesis.entity';
import { StatementEntity } from '@/statement/entities/statement.entity';
import { StatementNotFoundException } from '@/statement/exceptions/statement-not-found.exception';
import { SystemReadService } from '@/system/services/system-read.service';
import { UserReadService } from '@/user/services/user-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class StatementWriteService {
  public constructor(private readonly systemReadService: SystemReadService, private readonly userReadService: UserReadService, @InjectRepository(StatementEntity) private readonly repository: Repository<StatementEntity>) {
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

      const user = await this.userReadService.selectById(userId);

      const system = await this.systemReadService.selectById(systemId);

      if (user.id !== system.ownerUserId) {
        throw new OwnershipException();
      }

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
};
