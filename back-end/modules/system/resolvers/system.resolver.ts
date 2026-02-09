import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { SystemEntity } from '@/system/entities/system.entity';
import { EditSystemPayload } from '@/system/payloads/edit-system.payload';
import { NewSystemPayload } from '@/system/payloads/new-system.payload';
import { PaginatedSystemsPayload } from '@/system/payloads/paginated-systems.payload';
import { SearchSystemsPayload } from '@/system/payloads/search-systems.payload';
import { SystemReadService } from '@/system/services/system-read.service';
import { SystemWriteService } from '@/system/services/system-write.service';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class SystemResolver {
  public constructor(private readonly systemReadService: SystemReadService, private readonly systemWriteService: SystemWriteService) {
  }

  @Mutation((): typeof SystemEntity => {
    return SystemEntity;
  })
  @UseGuards(JwtGuard)
  public createSystem(@SessionUser('id') sessionUserId: string, @Args('systemPayload', new ValidationPipe({ transform: true })) newSystemPayload: NewSystemPayload): Promise<SystemEntity> {
    return this.systemWriteService.create(sessionUserId, newSystemPayload);
  }

  @Mutation((): typeof SystemEntity => {
    return SystemEntity;
  })
  @UseGuards(JwtGuard)
  public deleteSystem(@SessionUser('id') sessionUserId: string, @Args('systemId') systemId: string): Promise<SystemEntity> {
    return this.systemWriteService.delete(sessionUserId, systemId);
  }

  @Query((): typeof SystemEntity => {
    return SystemEntity;
  })
  public system(@Args('systemId') systemId: string): Promise<SystemEntity> {
    return this.systemReadService.selectById(systemId);
  }

  @Query((): typeof PaginatedSystemsPayload => {
    return PaginatedSystemsPayload;
  })
  public systems(@Args('filters', new ValidationPipe({ transform: true })) searchSystemsPayload: SearchSystemsPayload): Promise<PaginatedSystemsPayload> {
    return this.systemReadService.searchSystems(searchSystemsPayload);
  }

  @Mutation((): typeof SystemEntity => {
    return SystemEntity;
  })
  @UseGuards(JwtGuard)
  public updateSystem(@SessionUser('id') sessionUserId: string, @Args('systemId') systemId: string, @Args('systemPayload', new ValidationPipe({ transform: true })) editSystemPayload: EditSystemPayload): Promise<SystemEntity> {
    return this.systemWriteService.update(sessionUserId, systemId, editSystemPayload);
  }
};
