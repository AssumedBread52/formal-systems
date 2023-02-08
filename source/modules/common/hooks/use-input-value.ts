import { Dispatch, SetStateAction, useState } from 'react';

export const useInputValue = (isValid: (value: string) => boolean): [string, boolean, Dispatch<SetStateAction<string>>] => {
  const [value, setValue] = useState<string>('');

  return [value, !isValid(value), setValue];
};
