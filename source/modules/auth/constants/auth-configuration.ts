import { CredentialsInput, CredentialsPayload } from '@/auth/types';
import { buildMongoUrl } from '@/common/helpers';
import { ServerUser } from '@/user/types';
import { compare } from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { Account, Profile, Session, SessionStrategy, User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';

export const authConfiguration = {
  callbacks: {
    jwt: async (params: {
      token: JWT;
      user?: AdapterUser | User;
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
      user: AdapterUser | User;
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

          const client = await MongoClient.connect(buildMongoUrl());

          const usersCollection = client.db().collection<ServerUser>('users');

          const user = await usersCollection.findOne({
            email
          });

          await client.close();

          if (!user) {
            return null;
          }

          const { _id, hashedPassword } = user;

          const passwordsMatched = await compare(password, hashedPassword);

          if (!passwordsMatched) {
            return null;
          }

          return {
            id: _id.toString()
          };
        } catch {
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as SessionStrategy
  }
};
