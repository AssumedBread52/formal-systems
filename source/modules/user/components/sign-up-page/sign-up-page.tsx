import { Typography } from '@/common/components/typography/typography';
import { Box } from '@/common/components/box/box';
import { FormEvent, ReactElement } from 'react';

export const signUpPage = (): ReactElement => {
  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    console.log('submit form');
  };

  return (
    <Box mx='auto' width='32rem'>
      <section>
        <Typography as='h2' textAlign='center'>
          Sign Up
        </Typography>
        <form onSubmit={submitHandler}>
        </form>
      </section>
    </Box>
  );
};
