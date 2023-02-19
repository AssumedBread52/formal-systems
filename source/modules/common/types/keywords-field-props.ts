import { Dispatch, SetStateAction } from 'react';

export type KeywordsFieldProps = {
  updateKeywords: Dispatch<SetStateAction<string[]>>;
};
