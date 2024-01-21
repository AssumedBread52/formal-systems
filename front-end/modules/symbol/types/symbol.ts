import { SymbolType } from '@/symbol/enums/symbol-type';

export type Symbol = {
  id: string;
  title: string;
  description: string;
  type: SymbolType;
  content: string;
  axiomAppearances: number;
  nonAxiomaticStatementAppearances: number;
  systemId: string;
  createdByUserId: string;
};
