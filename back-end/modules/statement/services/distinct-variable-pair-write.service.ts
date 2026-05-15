import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { DistinctVariablePairNotFoundException } from '@/statement/exceptions/distinct-variable-pair-not-found.exception';
import { SystemReadService } from '@/system/services/system-read.service';
import { UserReadService } from '@/user/services/user-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DistinctVariablePairWriteService {
  public constructor(private readonly systemReadService: SystemReadService, private readonly userReadService: UserReadService, @InjectRepository(DistinctVariablePairEntity) private readonly repository: Repository<DistinctVariablePairEntity>) {
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
