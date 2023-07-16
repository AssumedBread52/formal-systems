import { SymbolType } from '@/symbol/enums/symbol-type';

export type EditSymbolPayload = {
  id: string;
  newTitle: string;
  newDescription: string;
  newType: SymbolType;
  newContent: string;
  systemId: string;
};
