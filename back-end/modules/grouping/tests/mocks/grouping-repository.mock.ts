import { GroupingEntity } from '@/grouping/grouping.entity';

export class GroupingRepositoryMock {
  findBy = jest.fn();

  findOneBy = jest.fn();

  remove = jest.fn((grouping: GroupingEntity): GroupingEntity => {
    return grouping;
  });

  save = jest.fn((grouping: GroupingEntity): GroupingEntity => {
    return grouping;
  });
};
