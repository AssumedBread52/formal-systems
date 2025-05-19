import { validatePayload } from '@/common/helpers/validate-payload';
import { PaginatedResultsPayload } from '@/common/payloads/paginated-results.payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { DefaultSearchPayload } from '@/system/payloads/default-search.payload';
import { CompositeAdapterRepository } from '@/system/repositories/composite-adapter.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemReadService {
  constructor(private compositeAdapterRepository: CompositeAdapterRepository) {
  }

  async readById(systemId: string): Promise<SystemEntity> {
    const system = await this.compositeAdapterRepository.readById({
      systemId
    });

    if (!system) {
      throw new SystemNotFoundException();
    }

    return system;
  }

  async readSystems(payload: any): Promise<PaginatedResultsPayload<SystemEntity>> {
    const searchPayload = validatePayload(payload, DefaultSearchPayload);

    const [systems, total] = await this.compositeAdapterRepository.readSystems(searchPayload);

    return new PaginatedResultsPayload(systems, total);
  }
};
