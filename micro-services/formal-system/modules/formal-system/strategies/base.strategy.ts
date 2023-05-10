import { IdPayload } from '@/formal-system/data-transfer-objects';

export interface BaseStrategy {
  validate: (...params: any[]) => Promise<IdPayload>;
};
