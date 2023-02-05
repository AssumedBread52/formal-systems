import { CredentialsInput, CredentialsPayload } from '@/auth/types';
import { getMongoClient } from '@/common/helpers';
import { ServerUser } from '@/user/types';
import { compare } from 'bcryptjs';
import { Account, Profile, Session, User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';
import NextAuth from 'next-auth/next';
import Credentials from 'next-auth/providers/credentials';

export const authConfiguration = NextAuth({
  callbacks: {
    jwt: async (params: {
      token: JWT;
      user?: User | AdapterUser;
      account?: Account | null;
      profile?: Profile;
      isNewUser?: boolean;
    }): Promise<JWT> => {
      const { token, user } = params;

      if (user) {
        token.id = user.id;
      }

      return token;
    },
    session: async (params: {
      session: Session;
      user: User | AdapterUser;
      token: JWT;
    }): Promise<Session> => {
      const { session, token } = params;

      session.id = token.id;

      return session;
    }
  },
  pages: {
    error: '/',
    newUser: '/',
    signIn: '/sign-in',
    signOut: '/sign-out',
    verifyRequest: '/'
  },
  providers: [
    Credentials<CredentialsInput>({
      credentials: {
        email: {},
        password: {}
      },
      authorize: async (credentials?: CredentialsPayload): Promise<User | null> => {
        try {
          if (!credentials) {
            return null;
          }

          const { email, password } = credentials;

          const client = await getMongoClient();

          const usersCollection = client.db().collection<ServerUser>('users');

          const user = await usersCollection.findOne({ email });

          await client.close();

          if (!user) {
            return null;
          }

          const { _id, hashedPassword } = user;

          const passwordsMatched = await compare(password, hashedPassword);

          if (!passwordsMatched) {
            return null;
          }

          return { id: _id.toString() };
        } catch {
          return null;
        }
      }
    })
  ],
  secret: 'lVDxQVEuB70xx0G4KVktCoNVrjSMjD95FKNa3p+c/Fc=',
  session: {
    strategy: 'jwt'
  }
});
