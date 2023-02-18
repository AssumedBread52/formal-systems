import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { Input } from '@/common/components/input/input';
import { Dispatch, FormEvent, ReactElement, SetStateAction, useEffect, useState } from 'react';

export const PaginationControls = (props: {
  total: number;
  count: number;
  setPage: Dispatch<SetStateAction<number>>;
  setCount: Dispatch<SetStateAction<number>>;
  setKeywords: Dispatch<SetStateAction<string[]>>;
}): ReactElement => {
  const { setKeywords } = props;

  const [terms, setTerms] = useState<string>('');

  useEffect((): (() => void) => {
    const termList = terms.trim().split(' ').filter((term: string): boolean => {
      return 0 !== term.length;
    });

    const delayedUpdate = setTimeout((): void => {
      setKeywords(termList);
    }, 300);

    return (): void => {
      clearTimeout(delayedUpdate);
    };
  }, [terms]);

  const inputHandler = (event: FormEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setTerms(event.currentTarget.value);
  };

  return (
    <Flex display='flex' mx='auto' width='7'>
      <label htmlFor='keywords'>
        Search
      </label>
      <Box mx='1' />
      <Input id='keywords' type='text' width='100%' value={terms} onInput={inputHandler} />
    </Flex>
  );
};
