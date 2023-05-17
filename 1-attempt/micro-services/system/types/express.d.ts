import { IdPayload } from '@/system/data-transfer-objects';

declare global {
  namespace Express {
    interface User extends IdPayload {
    }
  }
}
