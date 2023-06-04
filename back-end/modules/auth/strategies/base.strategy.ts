import { UserEntity } from '@/user/user.entity';

export interface BaseStrategy {
  validate: (...params: any[]) => Promise<UserEntity>;
};
