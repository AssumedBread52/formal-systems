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
    <Flex display='flex' p='2' alignItems='center'>
      <Box width='8rem'>
        {label}
      </Box>
      <Box mx='1' />
      <Grid display='grid' gridGap='2' gridTemplateColumns='repeat(auto-fill, minmax(11rem, 1fr))' width='100%'>
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
