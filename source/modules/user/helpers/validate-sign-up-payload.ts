import { hasText } from '@/common/helpers';
import { SignUpPayload } from '@/user/types';
import { isEmail } from './is-email';

export const validateSignUpPayload = (signUpPayload: SignUpPayload): boolean => {
  const { firstName, lastName, email, password } = signUpPayload;

  return hasText(firstName) && hasText(lastName) && isEmail(email) && hasText(password);
};
