import { FormActions } from '@/common/components/form-actions/form-actions';
import { InputField } from '@/common/components/input-field/input-field';
import { MutationPage } from '@/common/components/mutation-page/mutation-page';
import { hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { isEmail } from '@/user/helpers';
import { useSignUpUser } from '@/user/hooks';
import { ReactElement } from 'react';

export const SignUpPage = (): ReactElement => {
  const [firstName, firstNameHasError, setFirstName] = useInputValue(hasText);
  const [lastName, lastNameHasError, setLastName] = useInputValue(hasText);
  const [email, emailHasError, setEmail] = useInputValue(isEmail);
  const [password, passwordHasError, setPassword] = useInputValue(hasText);

  const { signUpUser, errorMessage, isLoading } = useSignUpUser(email, password);

  const submitHandler = (): void => {
    signUpUser({
      firstName,
      lastName,
      email,
      password
    });
  };

  const disableSubmit = firstNameHasError || lastNameHasError || emailHasError || passwordHasError;

  return (
    <MutationPage title='Sign Up' onSubmit={submitHandler}>
      <InputField label='First Name' value={firstName} hasError={firstNameHasError} type='text' updateValue={setFirstName} />
      <InputField label='Last Name' value={lastName} hasError={lastNameHasError} type='text' updateValue={setLastName} />
      <InputField label='Email Address' value={email} hasError={emailHasError} type='email' updateValue={setEmail} />
      <InputField label='Password' value={password} hasError={passwordHasError} type='password' updateValue={setPassword} />
      <FormActions disableSubmit={disableSubmit} submitTitle='Sign Up' isLoading={isLoading} errorMessage={errorMessage} />
    </MutationPage>
  );
};
