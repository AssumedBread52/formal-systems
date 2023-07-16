import { SymbolType } from '@/symbol/enums/symbol-type';

export type NewSymbolPayload = {
  title: string;
  description: string;
  type: SymbolType;
  content: string;
  systemId: string;
};
