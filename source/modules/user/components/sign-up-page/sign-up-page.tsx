import { Box } from '@/common/components/box/box';
import { FormActions } from '@/common/components/form-actions/form-actions';
import { InputField } from '@/common/components/input-field/input-field';
import { Typography } from '@/common/components/typography/typography';
import { hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { isEmail } from '@/user/helpers';
import { useSignUpUser } from '@/user/hooks';
import { FormEvent, ReactElement } from 'react';

export const SignUpPage = (): ReactElement => {
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
          <FormActions disableSubmit={disableSubmit} submitTitle='Sign Up' isLoading={isLoading} errorMessage={errorMessage} />
        </form>
      </section>
    </Box>
  );
};
