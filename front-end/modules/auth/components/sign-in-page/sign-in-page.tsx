import { useSignInUser } from '@/auth/hooks';
import { InputField } from '@/common/components/input-field/input-field';
import { MutationPage } from '@/common/components/mutation-page/mutation-page';
import { hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { ReactElement } from 'react';

export const SignInPage = (): ReactElement => {
  const [email, emailHasError, setEmail] = useInputValue(hasText);
  const [password, passwordHasError, setPassword] = useInputValue(hasText);

  const { signInUser, errorMessage, isLoading } = useSignInUser();

  const submitHandler = (): void => {
    signInUser({
      email,
      password
    });
  };

  const disableSubmit = emailHasError || passwordHasError;

  return (
    <MutationPage title='Sign In' disableSubmit={disableSubmit} submitTitle='Sign In' isLoading={isLoading} errorMessage={errorMessage} onSubmit={submitHandler}>
      <InputField label='Email Address' value={email} hasError={emailHasError} type='email' updateValue={setEmail} />
      <InputField label='Password' value={password} hasError={passwordHasError} type='password' updateValue={setPassword} />
    </MutationPage>
  );
};
