import { useSignOutUser } from '@/auth/hooks';
import { FormActions } from '@/common/components/form-actions/form-actions';
import { MutationPage } from '@/common/components/mutation-page/mutation-page';
import { ReactElement } from 'react';

export const SignOutPage = (): ReactElement => {
  const { signOutUser, errorMessage, isLoading } = useSignOutUser();

  const submitHandler = (): void => {
    signOutUser();
  };

  return (
    <MutationPage title='Sign Out' onSubmit={submitHandler}>
      <FormActions submitTitle='Sign Out' isLoading={isLoading} errorMessage={errorMessage} />
    </MutationPage>
  );
};
