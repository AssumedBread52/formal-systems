import { Dispatch, SetStateAction, useState } from 'react';

export const useInputValue = (isValid: (value: string) => boolean, initialValue: string = ''): [string, boolean, Dispatch<SetStateAction<string>>] => {
  const [value, setValue] = useState<string>(initialValue);

  return [value, !isValid(value), setValue];
};
