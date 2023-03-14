import { UserDocument } from '@/user/user-schema';

declare global {
  namespace Express {
    interface User extends UserDocument {
    }
  }
}
