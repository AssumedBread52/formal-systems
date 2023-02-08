import { Dispatch, HTMLInputTypeAttribute, SetStateAction } from 'react';

export type InputFieldProps = {
  label: string;
  type: HTMLInputTypeAttribute;
  value: string;
  hasError: string;
  updateValue: Dispatch<SetStateAction<string>>;
};
