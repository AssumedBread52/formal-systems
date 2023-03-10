import { Session, User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';

export type SessionCallbackParameters = {
  session: Session;
  user: AdapterUser | User;
  token: JWT;
};
