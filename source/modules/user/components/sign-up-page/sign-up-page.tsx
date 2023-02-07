import { Typography } from '@/common/components/typography/typography';
import { Box } from '@/common/components/box/box';
import { ReactElement } from 'react';

export const signUpPage = (): ReactElement => {
  return (
    <Box mx='auto' width='32rem'>
      <section>
        <Typography as='h2' textAlign='center'>
          Sign Up
        </Typography>
      </section>
    </Box>
  );
};
