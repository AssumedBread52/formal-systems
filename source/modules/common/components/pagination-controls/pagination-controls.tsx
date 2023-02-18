import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { Input } from '@/common/components/input/input';
import { Dispatch, FormEvent, ReactElement, SetStateAction, useEffect, useMemo, useState } from 'react';

export const PaginationControls = (props: {
  total: number;
  count: number;
  updatePage: Dispatch<SetStateAction<number>>;
  updateCount: Dispatch<SetStateAction<number>>;
  updateKeywords: Dispatch<SetStateAction<string[]>>;
}): ReactElement => {
  const { total, count, updatePage, updateCount, updateKeywords } = props;

  const [keywords, setKeywords] = useState<string>('');

  useEffect((): (() => void) => {
    const keywordList = keywords.trim().split(' ').filter((keyword: string): boolean => {
      return 0 !== keyword.length;
    });

    const delayedUpdate = setTimeout((): void => {
      updateKeywords(keywordList);
    }, 300);

    return (): void => {
      clearTimeout(delayedUpdate);
    };
  }, [keywords]);

  const pageOptions = useMemo((): number[] => {
    return Array.from({
      length: total / count
    }, (_: unknown, index: number): number => {
      return index + 1;
    });
  }, [count, total]);

  const countOptions = useMemo((): number[] => {
    return [1, 2, 5, 10, 20].filter((option: number): boolean => {
      return (option / 2) < total || option <= total;
    });
  }, [total]);

  const keywordInputHandler = (event: FormEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setKeywords(event.currentTarget.value);
  };

  return (
    <Flex display='flex' mx='auto' my='3' width='7'>
      <label htmlFor='keywords'>
        Search
      </label>
      <Box mx='1' />
      <Input id='keywords' type='text' width='100%' value={keywords} onInput={keywordInputHandler} />
    </Flex>
  );
};
