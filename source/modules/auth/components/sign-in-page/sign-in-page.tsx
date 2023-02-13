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
    <Box mx='auto' px='4' width='7'>
      <section>
        <Typography as='h1' textAlign='center' my='3'>
          Sign In
        </Typography>
        <form onSubmit={submitHandler}>
          <InputField label='Email Address' value={email} hasError={emailHasError} type='email' updateValue={setEmail} />
          <InputField label='Password' value={password} hasError={passwordHasError} type='password' updateValue={setPassword} />
          <Flex display='flex' flexDirection='column' alignItems='center' position='relative' my='2'>
            <Button disabled={disableSubmit} fontSize='formButton' height='3' width='5' type='submit'>
              Sign In
            </Button>
            {isLoading && (
              <Box position='absolute' top='0' right='4'>
                <LoadingSpinner size={2} />
              </Box>
            )}
            <Typography as='p' color='red' height='2'>
              {isError && 'Failed to sign in.'}
            </Typography>
          </Flex>
        </form>
      </section>
    </Box>
  );
};
