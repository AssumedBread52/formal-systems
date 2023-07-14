import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserEntity } from '@/user/user.entity';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, MongoRepository, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class SymbolCountSubscriber implements EntitySubscriberInterface<SymbolEntity> {
  constructor(dataSource: DataSource, @InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>) {
    dataSource.subscribers.push(this);
  }

  listenTo(): string | Function {
    return SymbolEntity;
  }

  async afterInsert(event: InsertEvent<SymbolEntity>): Promise<void> {
    const { entity } = event;

    const { createdByUserId } = entity;

    const user = await this.userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new NotFoundException('Symbol creator not found.');
    }

    user.symbolEntitiesCount++;

    this.userRepository.save(user);
  }

  async afterRemove(event: RemoveEvent<SymbolEntity>): Promise<void> {
    const { databaseEntity } = event;

    const { createdByUserId } = databaseEntity;

    const user = await this.userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new NotFoundException('Symbol creator not found.');
    }

    user.symbolEntitiesCount--;

    this.userRepository.save(user);
  }
};
