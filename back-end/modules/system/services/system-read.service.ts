import { validatePayload } from '@/common/helpers/validate-payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { PaginatedSystemsPayload } from '@/system/payloads/paginated-systems.payload';
import { SearchSystemsPayload } from '@/system/payloads/search-systems.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';

@Injectable()
export class SystemReadService {
  public constructor(@InjectRepository(SystemEntity) private readonly repository: Repository<SystemEntity>) {
  }

  public async searchSystems(searchSystemsPayload: SearchSystemsPayload): Promise<PaginatedSystemsPayload> {
    try {
      const validatedSearchSystemsPayload = validatePayload(searchSystemsPayload, SearchSystemsPayload);

      const take = validatedSearchSystemsPayload.pageSize;
      const skip = (validatedSearchSystemsPayload.page - 1) * validatedSearchSystemsPayload.pageSize;

      const where = [] as FindOptionsWhere<SystemEntity>[];
      const usersFilter = In(validatedSearchSystemsPayload.ownerUserIds);
      const textFilter = ILike(`%${validatedSearchSystemsPayload.searchText}%`);
      if (0 < validatedSearchSystemsPayload.ownerUserIds.length && 0 < validatedSearchSystemsPayload.searchText.length) {
        where.push({
          ownerUserId: usersFilter,
          name: textFilter
        });
        where.push({
          ownerUserId: usersFilter,
          description: textFilter
        });
      } else if (0 < validatedSearchSystemsPayload.ownerUserIds.length) {
        where.push({
          ownerUserId: usersFilter
        });
      } else if (0 < validatedSearchSystemsPayload.searchText.length) {
        where.push({
          name: textFilter
        });
        where.push({
          description: textFilter
        });
      }

      const [systems, total] = await this.repository.findAndCount({
        skip,
        take,
        where
      });

      return new PaginatedSystemsPayload(systems, total);
    } catch {
      throw new InternalServerErrorException('Reading systems failed');
    }
  }

  public async selectById(systemId: string): Promise<SystemEntity> {
    try {
      const system = await this.repository.findOneBy({
        id: systemId
      });

      if (!system) {
        throw new SystemNotFoundException();
      }

      return validatePayload(system, SystemEntity);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading system failed');
    }
  }
};
