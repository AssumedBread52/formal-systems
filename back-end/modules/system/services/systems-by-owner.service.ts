import { SystemEntity } from '@/system/entities/system.entity';
import { Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';

@Injectable({
  scope: Scope.REQUEST
})
export class SystemsByOwnerService {
  public constructor(@InjectRepository(SystemEntity) private readonly repository: Repository<SystemEntity>) {
  }

  public readonly loader = new DataLoader(async (ownerUserIds: readonly string[]): Promise<SystemEntity[][]> => {
    try {
      const systems = await this.repository.findBy({
        ownerUserId: In(ownerUserIds)
      });

      const systemsMap = systems.reduce((map: Map<string, SystemEntity[]>, system: SystemEntity): Map<string, SystemEntity[]> => {
        const systemsOwnedByUser = map.get(system.ownerUserId);

        if (!systemsOwnedByUser) {
          map.set(system.ownerUserId, [
            system
          ]);
        } else {
          systemsOwnedByUser.push(system);
        }

        return map;
      }, new Map<string, SystemEntity[]>());

      return ownerUserIds.map((ownerUserId: string): SystemEntity[] => {
        const systems = systemsMap.get(ownerUserId);

        if (!systems) {
          return [];
        }

        return systems;
      });
    } catch {
      throw new InternalServerErrorException('Loading systems failed');
    }
  });
};
