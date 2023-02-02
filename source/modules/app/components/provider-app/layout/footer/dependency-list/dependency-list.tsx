import { DependencyListProps } from '@/app/types';
import { Flex } from '@/common/components/flex/flex';
import { Grid } from '@/common/components/grid/grid';
import { ReactElement } from 'react';
import { DependencyItem } from './dependency-item/dependency-item';

export const DependencyList = (props: DependencyListProps): ReactElement => {
  const { label, list } = props;

  return (
    <Grid display='grid' gridGap='0.5rem' gridTemplateColumns='6rem auto' gridTemplateRows='auto' p='1rem'>
      <Flex display='flex' alignItems='center' justifyContent='center'>
        {label}
      </Flex>
      <Grid display='grid' gridGap='1rem' gridTemplateColumns='repeat(auto-fill, minmax(11rem, 1fr))'>
        {Object.keys(list).map((key: string): ReactElement => {
          return (
            <DependencyItem key={key} packageName={key} version={list[key]} />
          );
        })}
      </Grid>
    </Grid>
  );
};
