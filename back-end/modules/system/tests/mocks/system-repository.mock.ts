import { EntityRepositoryMock } from '@/common/tests/mocks/entity-repository.mock';
import { SystemEntity } from '@/system/system.entity';
import { ObjectId } from 'mongodb';

export class SystemRepositoryMock extends EntityRepositoryMock<SystemEntity> {
  findAndCount = jest.fn((): [SystemEntity[], number] => {
    return [this.entities, this.entities.length];
  });

  findOneBy = jest.fn((args: Partial<SystemEntity>): SystemEntity | null => {
    const { _id, title, createdByUserId } = args;

    for (const system of this.entities) {
      if ((!_id || _id.toString() === system._id.toString()) && (!title || title === system.title) && (!createdByUserId || createdByUserId.toString() === system.createdByUserId.toString())) {
        return system;
      }
    }

    return null;
  });

  remove = jest.fn((args: SystemEntity): SystemEntity => {
    const { _id } = args;

    this.entities = this.entities.filter((system: SystemEntity): boolean => {
      return _id.toString() !== system._id.toString();
    });

    return args;
  });

  save = jest.fn((args: SystemEntity): SystemEntity => {
    args._id = new ObjectId();

    this.entities.push(args);

    return args;
  });
};
