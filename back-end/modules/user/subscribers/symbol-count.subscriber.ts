import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolEntity } from '@/symbol/symbol.entity';
import { UserEntity } from '@/user/user.entity';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, MongoRepository, RemoveEvent } from 'typeorm';

@EventSubscriber()
export class SymbolCountSubscriber implements EntitySubscriberInterface<SymbolEntity> {
  constructor(@InjectRepository(UserEntity) private userRepository: MongoRepository<UserEntity>) {
  }

  listenTo(): string | Function {
    return SymbolEntity;
  }

  async afterInsert(event: InsertEvent<SymbolEntity>): Promise<void> {
    const { entity } = event;

    const { type, createdByUserId } = entity;

    const user = await this.userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new NotFoundException('Symbol creator not found.');
    }

    switch (type) {
      case SymbolType.Constant:
        user.constantSymbolCount++;
        break;
      case SymbolType.Variable:
        user.variableSymbolCount++;
        break;
    }

    this.userRepository.save(user);
  }

  async afterRemove(event: RemoveEvent<SymbolEntity>): Promise<void> {
    const { databaseEntity } = event;

    const { type, createdByUserId } = databaseEntity;

    const user = await this.userRepository.findOneBy({
      _id: createdByUserId
    });

    if (!user) {
      throw new NotFoundException('Symbol creator not found.');
    }

    switch (type) {
      case SymbolType.Constant:
        user.constantSymbolCount--;
        break;
      case SymbolType.Variable:
        user.variableSymbolCount--;
        break;
    }

    this.userRepository.save(user);
  }
};
