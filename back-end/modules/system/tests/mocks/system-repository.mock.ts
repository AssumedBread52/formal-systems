import { SystemEntity } from '@/system/system.entity';

export class SystemRepositoryMock {
  findAndCount = jest.fn();

  findOneBy = jest.fn();

  remove = jest.fn((system: SystemEntity): SystemEntity => {
    return system;
  });

  save = jest.fn((system: SystemEntity): SystemEntity => {
    return system;
  });
};
