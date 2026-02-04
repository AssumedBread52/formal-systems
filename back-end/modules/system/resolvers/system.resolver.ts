import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { SystemEntity } from '@/system/entities/system.entity';
import { EditSystemPayload } from '@/system/payloads/edit-system.payload';
import { NewSystemPayload } from '@/system/payloads/new-system.payload';
import { PaginatedSystemsPayload } from '@/system/payloads/paginated-systems.payload';
import { SearchSystemsPayload } from '@/system/payloads/search-systems.payload';
import { SystemService } from '@/system/services/system.service';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class SystemResolver {
  public constructor(private readonly systemService: SystemService) {
  }

  @Mutation((): typeof SystemEntity => {
    return SystemEntity;
  })
  @UseGuards(JwtGuard)
  public createSystem(@SessionUser('id') sessionUserId: string, @Args('systemPayload', new ValidationPipe({ transform: true })) newSystemPayload: NewSystemPayload): Promise<SystemEntity> {
    return this.systemService.create(sessionUserId, newSystemPayload);
  }

  @Mutation((): typeof SystemEntity => {
    return SystemEntity;
  })
  @UseGuards(JwtGuard)
  public deleteSystem(@SessionUser('id') sessionUserId: string, @Args('systemId') systemId: string): Promise<SystemEntity> {
    return this.systemService.delete(sessionUserId, systemId);
  }

  @Query((): typeof SystemEntity => {
    return SystemEntity;
  })
  public system(@Args('systemId') systemId: string): Promise<SystemEntity> {
    return this.systemService.selectById(systemId);
  }

  @Query((): typeof PaginatedSystemsPayload => {
    return PaginatedSystemsPayload;
  })
  public systems(@Args('filters', new ValidationPipe({ transform: true })) searchSystemsPayload: SearchSystemsPayload): Promise<PaginatedSystemsPayload> {
    return this.systemService.searchSystems(searchSystemsPayload);
  }

  @Mutation((): typeof SystemEntity => {
    return SystemEntity;
  })
  @UseGuards(JwtGuard)
  public updateSystem(@SessionUser('id') sessionUserId: string, @Args('systemId') systemId: string, @Args('systemPayload', new ValidationPipe({ transform: true })) editSystemPayload: EditSystemPayload): Promise<SystemEntity> {
    return this.systemService.update(sessionUserId, systemId, editSystemPayload);
  }
};
