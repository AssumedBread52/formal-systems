import { Account, Profile, User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';

export type JwtCallbackParameters = {
  token: JWT;
  user?: AdapterUser | User;
  account?: Account | null;
  profile?: Profile;
  isNewUser?: boolean;
};
