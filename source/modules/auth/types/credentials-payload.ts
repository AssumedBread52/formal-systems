import { CredentialsInput } from './credentials-input';

export type CredentialsPayload = Record<keyof CredentialsInput, string>;
