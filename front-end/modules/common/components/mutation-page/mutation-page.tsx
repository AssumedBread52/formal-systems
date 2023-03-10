import { Box } from '@/common/components/box/box';
import { FormActions } from '@/common/components/form-actions/form-actions';
import { Typography } from '@/common/components/typography/typography';
import { MutationPageProps } from '@/common/types';
import { FormEvent, PropsWithChildren, ReactElement } from 'react';

export const MutationPage = (props: PropsWithChildren<MutationPageProps>): ReactElement => {
  const { title, disableSubmit, submitTitle, isLoading, errorMessage, onSubmit, children } = props;

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
          <FormActions disableSubmit={disableSubmit} submitTitle={submitTitle} isLoading={isLoading} errorMessage={errorMessage} />
        </form>
      </section>
    </Box>
  );
};
