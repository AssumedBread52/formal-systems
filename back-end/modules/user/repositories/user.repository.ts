import { UserEntity } from '@/user/entities/user.entity';

export interface UserRepository {
  create(newUserPayload: any): Promise<UserEntity>;
  readByEmail(emailPayload: any): Promise<UserEntity | null>;
  readById(userIdPayload: any): Promise<UserEntity | null>;
  readConflictExists(conflictPayload: any): Promise<boolean>;
  update(user: any, editUserPayload: any): Promise<UserEntity>;
  updateCounts(user: any, newCountsPayload: any): Promise<UserEntity>;
};
