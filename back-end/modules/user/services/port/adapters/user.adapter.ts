import { UserEntity } from '@/user/entities/user.entity';

export abstract class UserAdapter {
  abstract create(newUserPayload: any): Promise<UserEntity>;
  abstract readByEmail(emailPayload: any): Promise<UserEntity | null>;
  abstract readById(userIdPayload: any): Promise<UserEntity | null>;
  abstract update(user: any, editUserPayload: any): Promise<UserEntity>;
};
