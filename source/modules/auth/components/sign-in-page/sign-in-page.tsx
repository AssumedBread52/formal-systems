import { useSignInUser } from '@/auth/hooks';
import { Box } from '@/common/components/box/box';
import { FormActions } from '@/common/components/form-actions/form-actions';
import { InputField } from '@/common/components/input-field/input-field';
import { Typography } from '@/common/components/typography/typography';
import { hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { FormEvent, ReactElement } from 'react';

export const SignInPage = (): ReactElement => {
  const [email, emailHasError, setEmail] = useInputValue(hasText);
  const [password, passwordHasError, setPassword] = useInputValue(hasText);

  const { signInUser, errorMessage, isLoading } = useSignInUser();

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    signInUser({
      email,
      password
    });
  };

  const disableSubmit = emailHasError || passwordHasError;

  return (
    <Box mx='auto' px='4' width='7'>
      <section>
        <Typography as='h1' textAlign='center' my='3'>
          Sign In
        </Typography>
        <form onSubmit={submitHandler}>
          <InputField label='Email Address' value={email} hasError={emailHasError} type='email' updateValue={setEmail} />
          <InputField label='Password' value={password} hasError={passwordHasError} type='password' updateValue={setPassword} />
          <FormActions disableSubmit={disableSubmit} submitTitle='Sign In' isLoading={isLoading} errorMessage={errorMessage} />
        </form>
      </section>
    </Box>
  );
};
