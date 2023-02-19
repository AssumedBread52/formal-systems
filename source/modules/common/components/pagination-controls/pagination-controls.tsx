import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { PaginationControlsProps } from '@/common/types';
import { Fragment, ReactElement } from 'react';
import { KeywordsField } from './keywords-field/keywords-field';
import { NumericSelectField } from './numeric-select-field/numeric-select-field';

export const PaginationControls = (props: PaginationControlsProps): ReactElement => {
  const { total, page, count, updatePage, updateCount, updateKeywords } = props;

  const pageOptionCount = Math.ceil(Math.max(total, 1) / count);

  const countOptionCount = Math.min(20, Math.max(2, Math.ceil(total / 5)));

  return (
    <Fragment>
      <Flex display='flex' mx='auto' my='2' width='7'>
        <KeywordsField updateKeywords={updateKeywords} />
      </Flex>
      <Flex display='flex' mx='auto' my='2' width='7'>
        Results Found: {total}
        <Box mx='auto' />
        <NumericSelectField label='Page' total={total} interval={1} optionCount={pageOptionCount} value={page} setValue={updatePage} />
        <Box mx='2' />
        <NumericSelectField label='Count' total={total} interval={5} optionCount={countOptionCount} value={count} setValue={updateCount} />
      </Flex>
    </Fragment>
  );
};
