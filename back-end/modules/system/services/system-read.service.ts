import { validatePayload } from '@/common/helpers/validate-payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { SystemNotFoundException } from '@/system/exceptions/system-not-found.exception';
import { PaginatedSystemsPayload } from '@/system/payloads/paginated-systems.payload';
import { SearchSystemsPayload } from '@/system/payloads/search-systems.payload';
import { SystemRepository } from '@/system/repositories/system.repository';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { isMongoId } from 'class-validator';

@Injectable()
export class SystemReadService {
  public constructor(private readonly systemRepository: SystemRepository) {
  }

  public async searchSystems(searchSystemsPayload: SearchSystemsPayload): Promise<PaginatedSystemsPayload> {
    try {
      const validatedSearchSystemsPayload = validatePayload(searchSystemsPayload, SearchSystemsPayload);

      const take = validatedSearchSystemsPayload.pageSize;
      const skip = (validatedSearchSystemsPayload.page - 1) * validatedSearchSystemsPayload.pageSize;

      const [systems, total] = await this.systemRepository.findAndCount({
        skip,
        take,
        keywords: validatedSearchSystemsPayload.keywords,
        userIds: validatedSearchSystemsPayload.userIds
      });

      return new PaginatedSystemsPayload(systems, total);
    } catch {
      throw new InternalServerErrorException('Reading systems failed');
    }
  }

  public async selectById(systemId: string): Promise<SystemEntity> {
    try {
      if (!isMongoId(systemId)) {
        throw new Error('Invalid system ID');
      }

      const system = await this.systemRepository.findOneBy({
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
};
