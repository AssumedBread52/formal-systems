import { useSignOutUser } from '@/auth/hooks';
import { Box } from '@/common/components/box/box';
import { FormActions } from '@/common/components/form-actions/form-actions';
import { Typography } from '@/common/components/typography/typography';
import { FormEvent, ReactElement } from 'react';

export const SignOutPage = (): ReactElement => {
  const { signOutUser, errorMessage, isLoading } = useSignOutUser();

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    signOutUser();
  };

  return (
    <Box mx='auto' px='4' width='7'>
      <section>
        <Typography as='h1' textAlign='center' my='3'>
          Sign Out
        </Typography>
        <form onSubmit={submitHandler}>
          <FormActions disableSubmit={false} submitTitle='Sign Out' isLoading={isLoading} errorMessage={errorMessage} />
        </form>
      </section>
    </Box>
  );
};
