import { UserDocument } from '@/user/user.schema';

export interface BaseStrategy {
  validate: (...params: any[]) => Promise<UserDocument>;
};
