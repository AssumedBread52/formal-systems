import { CredentialsInput, CredentialsPayload, JwtCallbackParameters, SessionCallbackParameters } from '@/auth-back-end/types';
import { MongoDatabase } from '@/common-back-end/classes';
import { ServerUser } from '@/user-back-end/types';
import { compare } from 'bcryptjs';
import { Session, SessionStrategy, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';

export const authConfiguration = {
  callbacks: {
    jwt: async (params: JwtCallbackParameters): Promise<JWT> => {
      const { token, user } = params;

      if (user) {
        const { id } = user;

        token.id = id;
      }

      return token;
    },
    session: async (params: SessionCallbackParameters): Promise<Session> => {
      const { session, token } = params;
      const { id } = token;

      session.id = id;

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

          const mongoDatabase = new MongoDatabase();

          const db = await mongoDatabase.getDb();

          const usersCollection = db.collection<ServerUser>('users');

          const user = await usersCollection.findOne({
            email
          });

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
