import { Box } from '@/common/components/box/box';
import { Typography } from '@/common/components/typography/typography';
import { ReactElement } from 'react';

export const FormalSystemsPage = (): ReactElement => {
  return (
    <Box px='4'>
      <section>
        <Typography as='h1' textAlign='center' my='3'>
          Formal Systems
        </Typography>
      </section>
    </Box>
  );
};
