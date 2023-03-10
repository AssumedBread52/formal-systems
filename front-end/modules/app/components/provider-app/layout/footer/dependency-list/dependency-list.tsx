import { DependencyListProps } from '@/app/types';
import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { Grid } from '@/common/components/grid/grid';
import { ReactElement } from 'react';
import { DependencyItem } from './dependency-item/dependency-item';

export const DependencyList = (props: DependencyListProps): ReactElement => {
  const { label, list } = props;

  const packageNames = Object.keys(list);

  return (
    <Flex display='flex' alignItems='center' p='1'>
      <Box width='5'>
        {label}
      </Box>
      <Box m='1' />
      <Grid display='grid' gridTemplateColumns='repeat(auto-fill, minmax(12rem, 1fr))' width='100%'>
        {packageNames.map((packageName: string): ReactElement => {
          const version = list[packageName];

          return (
            <DependencyItem key={packageName} packageName={packageName} version={version} />
          );
        })}
      </Grid>
    </Flex>
  );
};
