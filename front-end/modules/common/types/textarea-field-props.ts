import { Dispatch, SetStateAction } from 'react';

export type TextareaFieldProps = {
  label: string;
  value: string;
  hasError: boolean;
  updateValue: Dispatch<SetStateAction<string>>;
};
