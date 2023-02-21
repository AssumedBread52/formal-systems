import { Box } from '@/common/components/box/box';
import { Button } from '@/common/components/button/button';
import { Flex } from '@/common/components/flex/flex';
import { InputField } from '@/common/components/input-field/input-field';
import { LoadingSpinner } from '@/common/components/loading-spinner/loading-spinner';
import { Typography } from '@/common/components/typography/typography';
import { hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { isEmail } from '@/user/helpers';
import { useSignUpUser } from '@/user/hooks';
import { useRouter } from 'next/router';
import { FormEvent, MouseEvent, ReactElement } from 'react';

export const SignUpPage = (): ReactElement => {
  const router = useRouter();

  const [firstName, firstNameHasError, setFirstName] = useInputValue(hasText);
  const [lastName, lastNameHasError, setLastName] = useInputValue(hasText);
  const [email, emailHasError, setEmail] = useInputValue(isEmail);
  const [password, passwordHasError, setPassword] = useInputValue(hasText);

  const { signUpUser, errorMessage, isLoading } = useSignUpUser(email, password);

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    signUpUser({
      firstName,
      lastName,
      email,
      password
    });
  };

  const clickHandler = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    router.back();
  };

  const disableSubmit = firstNameHasError || lastNameHasError || emailHasError || passwordHasError;

  return (
    <Box mx='auto' px='4' width='7'>
      <section>
        <Typography as='h1' textAlign='center' my='3'>
          Sign Up
        </Typography>
        <form onSubmit={submitHandler}>
          <InputField label='First Name' value={firstName} hasError={firstNameHasError} type='text' updateValue={setFirstName} />
          <InputField label='Last Name' value={lastName} hasError={lastNameHasError} type='text' updateValue={setLastName} />
          <InputField label='Email Address' value={email} hasError={emailHasError} type='email' updateValue={setEmail} />
          <InputField label='Password' value={password} hasError={passwordHasError} type='password' updateValue={setPassword} />
          <Flex display='flex' flexDirection='column' alignItems='center' my='2'>
            <Button disabled={disableSubmit} fontSize='formButton' height='3' width='5' position='relative' type='submit'>
              Sign Up
              {isLoading && (
                <Box position='absolute' top='0' left='5' mx='2'>
                  <LoadingSpinner />
                </Box>
              )}
            </Button>
            <Box my='1' />
            <Button title='Go back' fontSize='formButton' height='3' width='5' onClick={clickHandler}>
              Cancel
            </Button>
            <Typography as='p' color='red' height='2'>
              {errorMessage}
            </Typography>
          </Flex>
        </form>
      </section>
    </Box>
  );
};
