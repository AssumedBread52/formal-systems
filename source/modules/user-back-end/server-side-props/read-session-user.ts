import { SessionUser } from '@/user-back-end/types';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

export const readSessionUser = async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<SessionUser>> => {
  try {
    const { req } = context;

    const response = await fetch('http://localhost:3000/api/user/session', {
      headers: {
        cookie: req.headers.cookie ?? ''
      }
    });

    if (!response.ok) {
      return {
        redirect: {
          destination: '/sign-up',
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
