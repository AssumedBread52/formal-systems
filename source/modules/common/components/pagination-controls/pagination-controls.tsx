import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { Select } from '@/common/components/select/select';
import { Dispatch, FormEvent, ReactElement, SetStateAction, useMemo } from 'react';
import { KeywordsField } from './keywords-field/keywords-field';

export const PaginationControls = (props: {
  total: number;
  page: number;
  count: number;
  updatePage: Dispatch<SetStateAction<number>>;
  updateCount: Dispatch<SetStateAction<number>>;
  updateKeywords: Dispatch<SetStateAction<string[]>>;
}): ReactElement => {
  const { total, page, count, updatePage, updateCount, updateKeywords } = props;

  const pageOptions = useMemo((): number[] => {
    const options = Array.from(Array(Math.ceil(Math.max(total, 1) / count) + 1).keys());

    options.shift();

    return options;
  }, [count, total]);

  const countOptions = useMemo((): number[] => {
    const options = Array.from(Array(Math.max(10, Math.min(total, 100)) + 1).keys());

    options.shift();

    return options;
  }, [total]);

  const pageInputHandler = (event: FormEvent<HTMLSelectElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    
    updatePage(parseInt(event.currentTarget.value));
  };

  const countInputHandler = (event: FormEvent<HTMLSelectElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    updateCount(parseInt(event.currentTarget.value));
  };

  return (
    <Flex display='flex' mx='auto' my='3' width='7'>
      <KeywordsField updateKeywords={updateKeywords} />
      <Box mx='2' />
      <label htmlFor='page'>
        Page
      </label>
      <Box mx='1' />
      <Select id='page' name='page' disabled={2 > pageOptions.length || 0 === total} minWidth='4' value={page} onInput={pageInputHandler}>
        {pageOptions.map((pageOption: number): ReactElement => {
          return (
            <option key={pageOption} value={pageOption}>
              {pageOption}
            </option>
          );
        })}
      </Select>
      <Box mx='1' />
      <label htmlFor='count'>
        Count
      </label>
      <Box mx='1' />
      <Select id='count' name='count' disabled={2 > countOptions.length || 0 === total} minWidth='4' value={count} onInput={countInputHandler}>
        {countOptions.map((countOption: number): ReactElement => {
          return (
            <option key={countOption} value={countOption}>
              {countOption}
            </option>
          );
        })}
      </Select>
    </Flex>
  );
};
