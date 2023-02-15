import { authConfiguration } from '@/auth/constants';
import { buildMongoUrl } from '@/common/helpers';
import { ServerUser, SessionUser } from '@/user/types';
import { MongoClient, ObjectId } from 'mongodb';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getServerSession } from 'next-auth';

export const readSessionUser = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<SessionUser>> => {
  try {
    const { req, res } = context;

    const session = await getServerSession(req, res, authConfiguration);

    if (!session) {
      return {
        redirect: {
          destination: '/sign-up',
          permanent: false
        }
      };
    }

    const { id } = session;

    const client = await MongoClient.connect(buildMongoUrl());

    const userCollection = client.db().collection<ServerUser>('users');

    const sessionUser = await userCollection.findOne({
      _id: new ObjectId(id)
    });

    await client.close();

    if (!sessionUser) {
      return {
        redirect: {
          destination: '/404',
          permanent: false
        }
      };
    }

    const { firstName, lastName, email } = sessionUser;

    return {
      props: {
        firstName,
        lastName,
        email
      }
    };
  } catch {
    return {
      redirect: {
        destination: '/404',
        permanent: false
      }
    };
  }
};
