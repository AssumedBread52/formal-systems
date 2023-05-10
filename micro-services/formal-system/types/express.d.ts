import { IdPayload } from '@/formal-system/data-transfer-objects';

declare global {
  namespace Express {
    interface User extends IdPayload {
    }
  }
}
