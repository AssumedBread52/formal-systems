import { Dispatch, SetStateAction } from 'react';

export type NumericSelectFieldProps = {
  label: string;
  total: number;
  interval: number;
  optionCount: number;
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
};
