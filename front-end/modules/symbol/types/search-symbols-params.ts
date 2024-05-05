import { SymbolType } from '@/symbol/enums/symbol-type';

export type SearchSymbolsParams = {
  page?: number;
  count?: number;
  keywords?: string[];
  types?: SymbolType[];
  systemId: string;
};
