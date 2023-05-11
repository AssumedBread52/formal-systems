import { IdPayload } from '@/system/data-transfer-objects';

export interface BaseStrategy {
  validate: (...params: any[]) => Promise<IdPayload>;
};
