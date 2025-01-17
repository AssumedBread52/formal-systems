import { SymbolType } from '@/symbol/enums/symbol-type';

export type Symbol = {
  id: string;
  title: string;
  description: string;
  type: SymbolType;
  content: string;
  axiomAppearanceCount: number;
  theoremAppearanceCount: number;
  deductionAppearanceCount: number;
  systemId: string;
  createdByUserId: string;
};
