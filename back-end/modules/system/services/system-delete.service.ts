import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { SystemEntity } from '@/system/entities/system.entity';
import { NotEmptyException } from '@/system/exceptions/not-empty.exception';
import { CompositeAdapterRepository } from '@/system/repositories/composite-adapter.repository';
import { Injectable } from '@nestjs/common';
import { SystemReadService } from './system-read.service';

@Injectable()
export class SystemDeleteService {
  constructor(private systemReadService: SystemReadService, private compositeAdapterRepository: CompositeAdapterRepository) {
  }

  async delete(sessionUserId: string, systemId: string): Promise<SystemEntity> {
    const system = await this.systemReadService.readById(systemId);

    const { constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount, proofCount, createdByUserId } = system;

    if (createdByUserId !== sessionUserId) {
      throw new OwnershipException();
    }

    if (0 < constantSymbolCount || 0 < variableSymbolCount || 0 < axiomCount || 0 < theoremCount || 0 < deductionCount || 0 < proofCount) {
      throw new NotEmptyException();
    }

    return this.compositeAdapterRepository.delete(system);
  }
};
