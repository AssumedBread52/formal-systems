import { SymbolType } from '@/symbol/enums/symbol-type';

export type SearchSymbolsQueryParams = {
  page?: number;
  count?: number;
  'keywords[]'?: string[];
  'types[]'?: SymbolType[];
};
