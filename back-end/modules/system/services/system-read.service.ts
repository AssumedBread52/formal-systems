import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemInUseException } from '@/system/exceptions/system-in-use.exception';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { UniqueNameException } from '@/system/exceptions/unique-name.exception';
import { PaginatedSystemsPayload } from '@/system/payloads/paginated-systems.payload';
import { SearchSystemsPayload } from '@/system/payloads/search-systems.payload';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, IsNull, Not, Repository } from 'typeorm';

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

      return system;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Reading system failed');
    }
  }

  public async verifyOwnership(userId: string, systemId: string): Promise<void> {
    try {
      const isOwned = await this.repository.existsBy({
        id: systemId,
        ownerUserId: userId
      });

      if (!isOwned) {
        throw new OwnershipException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying ownership failed');
    }
  }

  public async verifySystemNotInUse(systemId: string): Promise<void> {
    try {
      const inUse = await this.repository.existsBy({
        id: systemId,
        symbols: {
          id: Not(IsNull())
        }
      });

      if (inUse) {
        throw new SystemInUseException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying system not in use failed');
    }
  }

  public async verifyUniqueName(userId: string, name: string): Promise<void> {
    try {
      const conflict = await this.repository.existsBy({
        name,
        ownerUserId: userId
      });

      if (conflict) {
        throw new UniqueNameException();
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Verifying unique name failed');
    }
  }
};
