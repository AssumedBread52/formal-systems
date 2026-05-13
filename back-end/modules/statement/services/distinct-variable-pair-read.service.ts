import { DistinctVariablePairEntity } from '@/statement/entities/distinct-variable-pair.entity';
import { DistinctVariablePairNotFoundException } from '@/statement/exceptions/distinct-variable-pair-not-found.exception';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DistinctVariablePairReadService {
  public constructor(@InjectRepository(DistinctVariablePairEntity) private readonly repository: Repository<DistinctVariablePairEntity>) {
  }

  public async selectById(systemId: string, statementId: string, unorderedVariableSymbol1Id: string, unorderedVariableSymbol2Id: string): Promise<DistinctVariablePairEntity> {
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

      return distinctVariablePair;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading distinct variable pair failed');
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
