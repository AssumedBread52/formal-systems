import { Dispatch, SetStateAction } from 'react';

export type PaginationControlsProps = {
  total: number;
  page: number;
  count: number;
  updatePage: Dispatch<SetStateAction<number>>;
  updateCount: Dispatch<SetStateAction<number>>;
  updateKeywords: Dispatch<SetStateAction<string[]>>;
};
