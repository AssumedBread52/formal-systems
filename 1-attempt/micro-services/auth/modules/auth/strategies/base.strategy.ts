import { ServerUser } from '@/auth/data-transfer-objects';

export interface BaseStrategy {
  validate: (...params: any[]) => Promise<ServerUser>;
};
