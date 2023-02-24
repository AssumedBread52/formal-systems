import { Box } from '@/common/components/box/box';
import { Typography } from '@/common/components/typography/typography';
import { MutationPageProps } from '@/common/types';
import { FormEvent, PropsWithChildren, ReactElement } from 'react';

export const MutationPage = (props: PropsWithChildren<MutationPageProps>): ReactElement => {
  const { title, onSubmit, children } = props;

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    onSubmit();
  };

  return (
    <Box mx='auto' px='4' width='7'>
      <section>
        <Typography as='h1' textAlign='center' my='3'>
          {title}
        </Typography>
        <form onSubmit={submitHandler}>
          {children}
        </form>
      </section>
    </Box>
  );
};
