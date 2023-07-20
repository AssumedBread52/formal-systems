import { SystemEntity } from '@/system/system.entity';
import { ObjectId } from 'mongodb';

export class SystemRepositoryMock {
  systems = [] as SystemEntity[];
  findOneBy = jest.fn((args: Partial<SystemEntity>): SystemEntity | null => {
    const { _id, title, createdByUserId } = args;

    for (const system of this.systems) {
      if ((!_id || _id.toString() === system._id.toString()) && (!title || title === system.title) && (!createdByUserId || createdByUserId.toString() === system.createdByUserId.toString())) {
        return system;
      }
    }

    return null;
  });

  save = jest.fn((args: SystemEntity): SystemEntity => {
    args._id = new ObjectId();

    this.systems.push(args);

    return args;
  });
};
