import { Dispatch, HTMLInputTypeAttribute, SetStateAction } from 'react';

export type InputFieldProps = {
  label: string;
  type: HTMLInputTypeAttribute;
  value: string;
  hasError?: boolean;
  updateValue?: Dispatch<SetStateAction<string>>;
};
