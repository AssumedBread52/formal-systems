import { SystemEntity } from '@/system/entities/system.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { HttpException, Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';

@Injectable({
  scope: Scope.REQUEST
})
export class SystemBySymbolService {
  public constructor(@InjectRepository(SystemEntity) private readonly repository: Repository<SystemEntity>) {
  }

  public readonly loader = new DataLoader(async (systemIds: readonly string[]): Promise<SystemEntity[]> => {
    try {
      const systems = await this.repository.findBy({
        id: In(systemIds)
      });

      const systemsMap = systems.reduce((map: Map<string, SystemEntity>, system: SystemEntity): Map<string, SystemEntity> => {
        if (!map.has(system.id)) {
          map.set(system.id, system);
        }

        return map;
      }, new Map<string, SystemEntity>());

      return systemIds.map((systemId: string): SystemEntity => {
        const system = systemsMap.get(systemId);

        if (!system) {
          throw new SystemNotFoundException();
        }

        return system;
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Loading systems failed');
    }
  });
};
