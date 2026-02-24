import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { DistinctVariablePairEntity } from '@/distinct-variable-pair/entities/distinct-variable-pair.entity';
import { DistinctVariablePairNotFoundException } from '@/distinct-variable-pair/exceptions/distinct-variable-pair-not-found.exception';
import { InUseException } from '@/distinct-variable-pair/exceptions/in-use.exception';
import { InvalidSymbolTypeException } from '@/distinct-variable-pair/exceptions/invalid-symbol-type.exception';
import { MaxPairsExistException } from '@/distinct-variable-pair/exceptions/max-pairs-exist.exception';
import { UniquePairException } from '@/distinct-variable-pair/exceptions/unique-pair.exception';
import { NewDistinctVariablePairPayload } from '@/distinct-variable-pair/payloads/new-distinct-variable-pair.payload';
import { DistinctVariablePairRepository } from '@/distinct-variable-pair/repositories/distinct-variable-pair.repository';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SystemReadService } from '@/system/services/system-read.service';
import { UserReadService } from '@/user/services/user-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DistinctVariablePairWriteService {
  public constructor(private readonly distinctVariablePairRepository: DistinctVariablePairRepository, private readonly eventEmitter2: EventEmitter2, private readonly symbolReadService: SymbolReadService, private readonly systemReadService: SystemReadService, private readonly userReadService: UserReadService) {
  }

  public async create(userId: string, systemId: string, newDistinctVariablePairPayload: NewDistinctVariablePairPayload): Promise<DistinctVariablePairEntity> {
    try {
      const validatedNewDistinctVariablePairPayload = validatePayload(newDistinctVariablePairPayload, NewDistinctVariablePairPayload);

      const system = await this.systemReadService.selectById(systemId);

      const user = await this.userReadService.selectById(userId);

      if (user.id !== system.createdByUserId) {
        throw new OwnershipException();
      }

      if ((system.distinctVariablePairCount * 2) >= (system.variableSymbolCount * (system.variableSymbolCount - 1))) {
        throw new MaxPairsExistException();
      }

      const symbols = await this.symbolReadService.selectByIds(systemId, validatedNewDistinctVariablePairPayload.variableSymbolIds);

      symbols.forEach((symbol: SymbolEntity): void => {
        if (SymbolType.variable !== symbol.type) {
          throw new InvalidSymbolTypeException();
        }
      });

      const sortedVariableSymbolIds = validatedNewDistinctVariablePairPayload.variableSymbolIds.sort();

      const conflict = await this.distinctVariablePairRepository.findOneBy({
        variableSymbolIds: sortedVariableSymbolIds,
        systemId
      });

      if (conflict) {
        throw new UniquePairException();
      }

      const distinctVariablePair = new DistinctVariablePairEntity();

      distinctVariablePair.variableSymbolIds = sortedVariableSymbolIds;
      distinctVariablePair.systemId = systemId;
      distinctVariablePair.createdByUserId = user.id;

      const savedDistinctVariablePair = await this.distinctVariablePairRepository.save(distinctVariablePair);

      await this.eventEmitter2.emitAsync('distinct-variable-pair.create.completed', savedDistinctVariablePair);

      return savedDistinctVariablePair;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Creating distinct variable pair failed');
    }
  }

  public async delete(userId: string, systemId: string, distinctVariablePairId: string): Promise<DistinctVariablePairEntity> {
    try {
      const distinctVariablePair = await this.distinctVariablePairRepository.findOneBy({
        id: distinctVariablePairId,
        systemId
      });

      if (!distinctVariablePair) {
        throw new DistinctVariablePairNotFoundException();
      }

      const user = await this.userReadService.selectById(userId);

      if (user.id !== distinctVariablePair.createdByUserId) {
        throw new OwnershipException();
      }

      if (distinctVariablePair.isInUse()) {
        throw new InUseException();
      }

      const deletedDistinctVariablePair = await this.distinctVariablePairRepository.remove(distinctVariablePair);

      await this.eventEmitter2.emitAsync('distinct-variable-pair.delete.completed', deletedDistinctVariablePair);

      return deletedDistinctVariablePair;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Deleting distinct variable pair failed');
    }
  }
};
