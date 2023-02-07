import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { Input } from '@/common/components/input/input';
import { Typography } from '@/common/components/typography/typography';
import { hasText } from '@/common/helpers';
import { FocusEvent, FormEvent, ReactElement, useState } from 'react';

export const signUpPage = (): ReactElement => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  const [firstNameTouched, setFirstNameTouched] = useState<boolean>(false);
  const [lastNameTouched, setLastNameTouched] = useState<boolean>(false);

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

  const firstNameHasError = !hasText(firstName);
  const lastNameHasError = !hasText(lastName);

  const firstNameShowError = firstNameTouched && firstNameHasError;
  const lastNameShowError = lastNameTouched && lastNameHasError;

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    console.log('sign-up-payload', {
      firstName,
      lastName
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
        </form>
      </section>
    </Box>
  );
};
