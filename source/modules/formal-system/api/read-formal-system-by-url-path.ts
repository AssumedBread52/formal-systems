import { authConfiguration } from '@/auth/constants';
import { buildMongoUrl, extractUrlPathValue } from '@/common/helpers';
import { ClientFormalSystem, ServerFormalSystem } from '@/formal-system/types';
import { MongoClient } from 'mongodb';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getServerSession } from 'next-auth';

export const readFormalSystemByUrlPath = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<ClientFormalSystem>> => {
  try {
    const { req, res } = context;

    const formalSystemUrlPath = extractUrlPathValue(context, 'formal-system-url-path');

    const session = await getServerSession(req, res, authConfiguration);

    if (!session) {
      return {
        redirect: {
          destination: `/${formalSystemUrlPath}`,
          permanent: false
        }
      };
    }

    const { id } = session;

    const client = await MongoClient.connect(buildMongoUrl());

    const formalSystemCollection = client.db().collection<ServerFormalSystem>('formal-systems');

    const formalSystem = await formalSystemCollection.findOne({
      urlPath: formalSystemUrlPath,
      createdByUserId: id
    });

    await client.close();

    if (!formalSystem) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      };
    }

    const { _id, title, urlPath, description, createdByUserId } = formalSystem;

    return {
      props: {
        id: _id.toString(),
        title,
        urlPath,
        description,
        createdByUserId
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
