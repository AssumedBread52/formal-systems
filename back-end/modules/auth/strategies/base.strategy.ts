import { UserEntity } from '@/user/entities/user.entity';

export interface BaseStrategy {
  validate: (...params: any[]) => Promise<UserEntity>;
};
