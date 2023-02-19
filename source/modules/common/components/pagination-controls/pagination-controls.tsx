import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { Dispatch, ReactElement, SetStateAction } from 'react';
import { KeywordsField } from './keywords-field/keywords-field';
import { NumericSelectField } from './numeric-select-field/numeric-select-field';

export const PaginationControls = (props: {
  total: number;
  page: number;
  count: number;
  updatePage: Dispatch<SetStateAction<number>>;
  updateCount: Dispatch<SetStateAction<number>>;
  updateKeywords: Dispatch<SetStateAction<string[]>>;
}): ReactElement => {
  const { total, page, count, updatePage, updateCount, updateKeywords } = props;

  const pageOptionCount = Math.ceil(Math.max(total, 1) / count);

  const countOptionCount = Math.min(20, Math.max(2, Math.ceil(total / 5)));

  return (
    <Flex display='flex' mx='auto' my='3' width='7'>
      <KeywordsField updateKeywords={updateKeywords} />
      <Box mx='2' />
      <NumericSelectField label='Page' total={total} interval={1} optionCount={pageOptionCount} value={page} setValue={updatePage} />
      <Box mx='1' />
      <NumericSelectField label='Count' total={total} interval={5} optionCount={countOptionCount} value={count} setValue={updateCount} />
    </Flex>
  );
};
