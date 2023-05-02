import { ServerUser } from '@/auth/data-transfer-objects';

declare global {
  namespace Express {
    interface User extends ServerUser {
    }
  }
}
