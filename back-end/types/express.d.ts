import { UserEntity } from '@/user/user.entity';

declare global {
  namespace Express {
    interface User extends UserEntity {
    }
  }
}
