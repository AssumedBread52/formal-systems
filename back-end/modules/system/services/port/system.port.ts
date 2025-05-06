import { validatePayload } from '@/common/helpers/validate-payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { AdapterType } from '@/system/enums/adapter-type.enum';
import { SearchPayload } from '@/system/payloads/search.payload';
import { Injectable } from '@nestjs/common';
import { MongoAdapter } from './adapters/mongo.adapter';
import { SystemAdapter } from './adapters/system.adapter';

@Injectable()
export class SystemPort {
  constructor(private mongoAdapter: MongoAdapter) {
  }

  create(newSystemPayload: any): Promise<SystemEntity> {
    return this.mongoAdapter.create(newSystemPayload);
  }

  async readById(systemIdPayload: any): Promise<SystemEntity | null> {
    const adapters = this.getAdapters();

    const systemRequests = adapters.map(async (adapter: SystemAdapter): Promise<SystemEntity | null> => {
      try {
        return await adapter.readById(systemIdPayload);
      } catch {
        return null;
      }
    });

    const systems = await Promise.all(systemRequests);

    for (const system of systems) {
      if (system) {
        return system;
      }
    }

    return null;
  }

  async readConflictExists(conflictPayload: any): Promise<boolean> {
    const adapters = this.getAdapters();

    const conflictCheckRequests = adapters.map(async (adapter: SystemAdapter): Promise<boolean> => {
      try {
        return await adapter.readConflictExists(conflictPayload);
      } catch {
        return false;
      }
    });

    const conflictChecks = await Promise.all(conflictCheckRequests);

    for (const conflictCheck of conflictChecks) {
      if (conflictCheck) {
        return conflictCheck;
      }
    }

    return false;
  }

  async readSystems(searchPayload: any): Promise<[SystemEntity[], number]> {
    const { page, pageSize, keywords, userIds } = validatePayload(searchPayload, SearchPayload);
    const adapters = this.getAdapters();

    const systems = [];
    let total = 0;

    let skip = (page - 1) * pageSize;
    let take = pageSize;
    for (const adapter of adapters) {
      const [results, count] = await adapter.readSystems({
        skip,
        take,
        keywords,
        userIds
      });

      systems.push(...results);
      total += count;

      skip -= count - results.length;
      take -= results.length;
    }

    return [systems, total];
  }

  update(system: any, editSystemPayload: any): Promise<SystemEntity> {
    const systemEntity = validatePayload(system, SystemEntity);

    const adapter = this.getAdapter(systemEntity);

    return adapter.update(system, editSystemPayload);
  }

  delete(system: any): Promise<SystemEntity> {
    const systemEntity = validatePayload(system, SystemEntity);

    const adapter = this.getAdapter(systemEntity);

    return adapter.delete(system);
  }

  private getAdapter(system: SystemEntity): SystemAdapter {
    const { type } = system;

    switch (type) {
      case AdapterType.Mongo:
        return this.mongoAdapter;
    }
  }

  private getAdapters(): SystemAdapter[] {
    return [
      this.mongoAdapter
    ];
  }
};
