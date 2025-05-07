import { validatePayload } from '@/common/helpers/validate-payload';
import { SystemEntity } from '@/system/entities/system.entity';
import { UserEntity } from '@/user/entities/user.entity';
import { UserPort } from '@/user/services/port/user.port';
import { UserReadService } from '@/user/services/user-read.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SystemCountListener {
  constructor(private userReadService: UserReadService, private userPort: UserPort) {
  }

  @OnEvent('system.created', {
    suppressErrors: false
  })
  async incrementSystemCount(payload: any): Promise<UserEntity> {
    const { createdByUserId } = validatePayload(payload, SystemEntity);

    const user = await this.userReadService.readById(createdByUserId);

    const { systemCount } = user;

    return this.userPort.updateCounts(user, {
      systemCount: systemCount + 1
    });
  }

  @OnEvent('system.deleted', {
    suppressErrors: false
  })
  async decrementSystemCount(payload: any): Promise<UserEntity> {
    const { createdByUserId } = validatePayload(payload, SystemEntity);

    const user = await this.userReadService.readById(createdByUserId);

    const { systemCount } = user;

    return this.userPort.updateCounts(user, {
      systemCount: systemCount - 1
    });
  }
};
