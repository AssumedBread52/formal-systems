import { SessionUser } from '@/auth/decorators/session-user.decorator';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { SystemEntity } from '@/system/entities/system.entity';
import { NewSystemPayload } from '@/system/payloads/new-system.payload';
import { SystemService } from '@/system/services/system.service';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

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
};
