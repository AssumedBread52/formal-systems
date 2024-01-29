import { GroupingEntity } from '@/grouping/grouping.entity';

export class GroupingRepositoryMock {
  findOneBy = jest.fn();

  save = jest.fn((grouping: GroupingEntity): GroupingEntity => {
    return grouping;
  });
};
