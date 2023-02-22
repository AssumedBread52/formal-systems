import { Box } from '@/common/components/box/box';
import { FormActions } from '@/common/components/form-actions/form-actions';
import { InputField } from '@/common/components/input-field/input-field';
import { Typography } from '@/common/components/typography/typography';
import { hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { isEmail } from '@/user/helpers';
import { useEditUser } from '@/user/hooks';
import { SessionUser } from '@/user/types';
import { FormEvent, ReactElement } from 'react';

export const EditProfilePage = (props: SessionUser): ReactElement => {
  const { firstName, lastName, email } = props;

  const [newFirstName, firstNameHasError, setFirstName] = useInputValue(hasText, firstName);
  const [newLastName, lastNameHasError, setLastName] = useInputValue(hasText, lastName);
  const [newEmail, emailHasError, setEmail] = useInputValue(isEmail, email);
  const [newPassword, passwordHasError, setPassword] = useInputValue(hasText);

  const { editUser, errorMessage, isLoading } = useEditUser();

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    editUser({
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail,
      password: newPassword
    });
  };

  const disableSubmit = ((firstNameHasError && lastNameHasError && emailHasError) || (newFirstName === firstName && newLastName === lastName && newEmail === email)) && passwordHasError;

  return (
    <Box mx='auto' px='4' width='7'>
      <section>
        <Typography as='h1' textAlign='center' my='3'>
          Edit Profile
        </Typography>
        <form onSubmit={submitHandler}>
          <InputField label='First Name' value={newFirstName} hasError={firstNameHasError} type='text' updateValue={setFirstName} />
          <InputField label='Last Name' value={newLastName} hasError={lastNameHasError} type='text' updateValue={setLastName} />
          <InputField label='Email Address' value={newEmail} hasError={emailHasError} type='email' updateValue={setEmail} />
          <InputField label='Password' value={newPassword} hasError={passwordHasError} type='password' updateValue={setPassword} />
          <FormActions disableSubmit={disableSubmit} submitTitle='Save Changes' isLoading={isLoading} errorMessage={errorMessage} />
        </form>
      </section>
    </Box>
  );
};
