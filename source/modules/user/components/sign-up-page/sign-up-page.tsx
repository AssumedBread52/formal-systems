import { Box } from '@/common/components/box/box';
import { Button } from '@/common/components/button/button';
import { Flex } from '@/common/components/flex/flex';
import { Input } from '@/common/components/input/input';
import { LoadingSpinner } from '@/common/components/loading-spinner/loading-spinner';
import { Typography } from '@/common/components/typography/typography';
import { hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { isEmail } from '@/user/helpers';
import { useSignUpUser } from '@/user/hooks';
import { FocusEvent, FormEvent, ReactElement, useState } from 'react';

export const SignUpPage = (): ReactElement => {
  const [firstName, firstNameHasError, setFirstName] = useInputValue(hasText);
  const [lastName, lastNameHasError, setLastName] = useInputValue(hasText);
  const [email, emailHasError, setEmail] = useInputValue(isEmail);
  const [password, passwordHasError, setPassword] = useInputValue(hasText);

  const { signUpUser, errorMessage, isLoading } = useSignUpUser(email, password);

  const [firstNameTouched, setFirstNameTouched] = useState<boolean>(false);
  const [lastNameTouched, setLastNameTouched] = useState<boolean>(false);
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);

  const firstNameBlurHandler = (event: FocusEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setFirstNameTouched(true);
  };
  const lastNameBlurHandler = (event: FocusEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setLastNameTouched(true);
  };
  const emailBlurHandler = (event: FocusEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setEmailTouched(true);
  };
  const passwordBlurHandler = (event: FocusEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setPasswordTouched(true);
  };

  const firstNameInputHandler = (event: FormEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setFirstName(event.currentTarget.value);
  };
  const lastNameInputHandler = (event: FormEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setLastName(event.currentTarget.value);
  };
  const emailInputHandler = (event: FormEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setEmail(event.currentTarget.value);
  };
  const passwordInputHandler = (event: FormEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setPassword(event.currentTarget.value);
  };

  const firstNameShowError = firstNameTouched && firstNameHasError;
  const lastNameShowError = lastNameTouched && lastNameHasError;
  const emailShowError = emailTouched && emailHasError;
  const passwordShowError = passwordTouched && passwordHasError;

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

  return (
    <Box mx='auto' width='32rem'>
      <section>
        <Typography as='h2' textAlign='center'>
          Sign Up
        </Typography>
        <form onSubmit={submitHandler}>
          <Flex display='flex' flexWrap='wrap' justifyContent='space-between'>
            <Flex flexBasis='25%'>
              <label htmlFor='first-name'>
                First Name
              </label>
            </Flex>
            <Flex flexBasis='65%'>
              <Input id='first-name' type='text' width='100%' value={firstName} onBlur={firstNameBlurHandler} onInput={firstNameInputHandler} />
            </Flex>
            <Typography as='p' color='red' fontSize='0.75rem' height='1rem' width='100%' m='0'>
              {firstNameShowError && 'Please enter your first name.'}
            </Typography>
          </Flex>
          <Flex display='flex' flexWrap='wrap' justifyContent='space-between'>
            <Flex flexBasis='25%'>
              <label htmlFor='last-name'>
                Last Name
              </label>
            </Flex>
            <Flex flexBasis='65%'>
              <Input id='last-name' type='text' width='100%' value={lastName} onBlur={lastNameBlurHandler} onInput={lastNameInputHandler} />
            </Flex>
            <Typography as='p' color='red' fontSize='0.75rem' height='1rem' width='100%' m='0'>
              {lastNameShowError && 'Please enter your last name.'}
            </Typography>
          </Flex>
          <Flex display='flex' flexWrap='wrap' justifyContent='space-between'>
            <Flex flexBasis='25%'>
              <label htmlFor='email-address'>
                Email Address
              </label>
            </Flex>
            <Flex flexBasis='65%'>
              <Input id='email-address' type='email' width='100%' value={email} onBlur={emailBlurHandler} onInput={emailInputHandler} />
            </Flex>
            <Typography as='p' color='red' fontSize='0.75rem' height='1rem' width='100%' m='0'>
              {emailShowError && 'Please enter your email address.'}
            </Typography>
          </Flex>
          <Flex display='flex' flexWrap='wrap' justifyContent='space-between'>
            <Flex flexBasis='25%'>
              <label htmlFor='password'>
                Password
              </label>
            </Flex>
            <Flex flexBasis='65%'>
              <Input id='password' type='password' width='100%' value={password} onBlur={passwordBlurHandler} onInput={passwordInputHandler} />
            </Flex>
            <Typography as='p' color='red' fontSize='0.75rem' height='1rem' width='100%' m='0'>
              {passwordShowError && 'Please enter a password.'}
            </Typography>
          </Flex>
          <Flex display='flex' flexDirection='column' alignItems='center'>
            <Button disabled={firstNameHasError || lastNameHasError || emailHasError || passwordHasError} fontSize='1rem' px='4rem' py='0.5rem' type='submit'>
              Sign Up
            </Button>
            <Typography as='p' color='red' height='1rem'>
              {errorMessage}
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
