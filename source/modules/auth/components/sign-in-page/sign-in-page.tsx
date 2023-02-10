import { useSignInUser } from '@/auth/hooks';
import { Box } from '@/common/components/box/box';
import { Button } from '@/common/components/button/button';
import { Flex } from '@/common/components/flex/flex';
import { InputField } from '@/common/components/input-field/input-field';
import { LoadingSpinner } from '@/common/components/loading-spinner/loading-spinner';
import { Typography } from '@/common/components/typography/typography';
import { hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { FormEvent, ReactElement } from 'react';

export const SignInPage = (): ReactElement => {
  const [email, emailHasError, setEmail] = useInputValue(hasText);
  const [password, passwordHasError, setPassword] = useInputValue(hasText);

  const [signInUser, isError, isLoading] = useSignInUser();

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
    <Box mx='auto' my='4' width='32rem'>
      <section>
        <Typography as='h1' textAlign='center' my='3'>
          Sign In
        </Typography>
        <form onSubmit={submitHandler}>
          <InputField label='Email Address' value={email} hasError={emailHasError} type='email' updateValue={setEmail} />
          <InputField label='Password' value={password} hasError={passwordHasError} type='password' updateValue={setPassword} />
          <Flex display='flex' flexDirection='column' alignItems='center' my='3'>
            <Button disabled={disableSubmit} fontSize='1rem' px='4rem' py='0.5rem' type='submit'>
              Sign In
            </Button>
            <Typography as='p' color='red' height='1rem'>
              {isError && 'Failed to sign in.'}
            </Typography>
          </Flex>
        </form>
        <Box height='4rem'>
          {isLoading && (
            <LoadingSpinner />
          )}
        </Box>
      </section>
    </Box>
  );
};
