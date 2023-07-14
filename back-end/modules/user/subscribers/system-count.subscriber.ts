import { SystemEntity } from '@/system/system.entity';
import { UserEntity } from '@/user/user.entity';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, Repository } from 'typeorm';

@EventSubscriber()
export class SystemCountSubscriber implements EntitySubscriberInterface<SystemEntity> {
  constructor(dataSource: DataSource, @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>) {
    dataSource.subscribers.push(this);
  }

  listenTo(): string | Function {
    return SystemEntity;
  }

  async afterInsert(event: InsertEvent<SystemEntity>): Promise<void> {
    const { entity } = event;

    const { createdByUserId } = entity;

    const user = await this.userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new NotFoundException('Formal System creator not found.');
    }

    user.systemEntitiesCount++;

    this.userRepository.save(user);
  }

  async afterRemove(event: RemoveEvent<SystemEntity>): Promise<void> {
    const { databaseEntity } = event;

    const { createdByUserId } = databaseEntity;

    const user = await this.userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new NotFoundException('Formal System creator not found.');
    }

    user.systemEntitiesCount--;

    this.userRepository.save(user);
  }
};
