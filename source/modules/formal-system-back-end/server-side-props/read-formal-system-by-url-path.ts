import { extractUrlPathValue } from '@/common/helpers';
import { ClientFormalSystem } from '@/formal-system/types';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

export const readFormalSystemByUrlPath = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<ClientFormalSystem>> => {
  try {
    const urlPath = extractUrlPathValue(context, 'formal-system-url-path');

    const response = await fetch(`http://localhost:3000/api/formal-system/${urlPath}`);

    if (!response.ok) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      };
    }

    return {
      props: await response.json()
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
