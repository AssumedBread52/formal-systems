import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { DistinctVariablePairNotFoundException } from '@/statement/exceptions/distinct-variable-pair-not-found.exception';
import { NonDistinctVariableSymbolIdsException } from '@/statement/exceptions/non-distinct-variable-symbol-ids.exception';
import { UniqueVariablePairException } from '@/statement/exceptions/unique-variable-pair.exception';
import { NewDistinctVariablePairPayload } from '@/statement/payloads/new-distinct-variable-pair.payload';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SystemReadService } from '@/system/services/system-read.service';
import { UserReadService } from '@/user/services/user-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HypothesisReadService } from './hypothesis-read.service';
import { StatementReadService } from './statement-read.service';

@Injectable()
export class DistinctVariablePairWriteService {
  public constructor(private readonly hypothesisReadService: HypothesisReadService, private readonly statementReadService: StatementReadService, private readonly symbolReadService: SymbolReadService, private readonly systemReadService: SystemReadService, private readonly userReadService: UserReadService, @InjectRepository(DistinctVariablePairEntity) private readonly repository: Repository<DistinctVariablePairEntity>) {
  }

  public async create(userId: string, systemId: string, statementId: string, newDistinctVariablePairPayload: NewDistinctVariablePairPayload): Promise<DistinctVariablePairEntity> {
    try {
      const validatedNewDistinctVariablePairPayload = validatePayload(newDistinctVariablePairPayload, NewDistinctVariablePairPayload);

      if (validatedNewDistinctVariablePairPayload.variableSymbol1Id === validatedNewDistinctVariablePairPayload.variableSymbol2Id) {
        throw new NonDistinctVariableSymbolIdsException();
      }

      const user = await this.userReadService.selectById(userId);

      const system = await this.systemReadService.selectById(systemId);

      if (user.id !== system.ownerUserId) {
        throw new OwnershipException();
      }

      const statement = await this.statementReadService.selectById(systemId, statementId);

      return await this.repository.manager.transaction('SERIALIZABLE', async (entityManager: EntityManager): Promise<DistinctVariablePairEntity> => {
        const distinctVariablePairRepository = entityManager.getRepository(DistinctVariablePairEntity);

        await this.symbolReadService.verifyAllExist(systemId, [
          validatedNewDistinctVariablePairPayload.variableSymbol1Id,
          validatedNewDistinctVariablePairPayload.variableSymbol2Id
        ]);

        await this.symbolReadService.verifySymbolType(entityManager, systemId, [
          validatedNewDistinctVariablePairPayload.variableSymbol1Id,
          validatedNewDistinctVariablePairPayload.variableSymbol2Id
        ], SymbolType.variable);

        await this.hypothesisReadService.verifyAllSymbolsTyped(entityManager, systemId, statementId, [
          validatedNewDistinctVariablePairPayload.variableSymbol1Id,
          validatedNewDistinctVariablePairPayload.variableSymbol2Id
        ]);

        const [variableSymbol1Id, variableSymbol2Id] = this.orderIds(validatedNewDistinctVariablePairPayload.variableSymbol1Id, validatedNewDistinctVariablePairPayload.variableSymbol2Id);

        const pairConflict = await distinctVariablePairRepository.existsBy({
          systemId,
          statementId,
          variableSymbol1Id,
          variableSymbol2Id
        });

        if (pairConflict) {
          throw new UniqueVariablePairException();
        }

        const distinctVariablePair = new DistinctVariablePairEntity();

        distinctVariablePair.systemId = system.id;
        distinctVariablePair.statementId = statement.id;
        distinctVariablePair.variableSymbol1Id = variableSymbol1Id;
        distinctVariablePair.variableSymbol2Id = variableSymbol2Id;

        return await distinctVariablePairRepository.save(distinctVariablePair);
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Creating distinct variable pair failed');
    }
  }

  public async delete(userId: string, systemId: string, statementId: string, unorderedVariableSymbol1Id: string, unorderedVariableSymbol2Id: string): Promise<DistinctVariablePairEntity> {
    try {
      const [variableSymbol1Id, variableSymbol2Id] = this.orderIds(unorderedVariableSymbol1Id, unorderedVariableSymbol2Id);

      const distinctVariablePair = await this.repository.findOneBy({
        systemId,
        statementId,
        variableSymbol1Id,
        variableSymbol2Id
      });

      if (!distinctVariablePair) {
        throw new DistinctVariablePairNotFoundException();
      }

      const user = await this.userReadService.selectById(userId);

      const system = await this.systemReadService.selectById(systemId);

      if (user.id !== system.ownerUserId) {
        throw new OwnershipException();
      }

      const removedDistinctVariablePair = await this.repository.remove(distinctVariablePair);

      removedDistinctVariablePair.statementId = statementId;
      removedDistinctVariablePair.variableSymbol1Id = variableSymbol1Id;
      removedDistinctVariablePair.variableSymbol2Id = variableSymbol2Id;

      return removedDistinctVariablePair;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Deleting distinct variable pair failed');
    }
  }

  private orderIds(unorderedId1: string, unorderedId2: string): [string, string] {
    if (unorderedId1 < unorderedId2) {
      return [unorderedId1, unorderedId2];
    } else {
      return [unorderedId2, unorderedId1];
    }
  }
};
