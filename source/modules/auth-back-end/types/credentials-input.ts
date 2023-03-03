import { CredentialInput } from 'next-auth/providers';

export type CredentialsInput = {
  email: CredentialInput;
  password: CredentialInput;
};
