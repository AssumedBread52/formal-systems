import { ProtectedContentProps } from '@/auth/types/protected-content-props';
import { fetchSessionUser } from '@/user/fetch-data/fetch-session-user';
import { cookies } from 'next/headers';
import { Fragment, PropsWithChildren, ReactElement } from 'react';

export const ProtectedContent = async (props: PropsWithChildren<ProtectedContentProps>): Promise<ReactElement> => {
  const { children, userId } = props;

  const tokenCookie = cookies().get('token');

  if (!tokenCookie) {
    return (
      <Fragment />
    );
  }

  const { id } = await fetchSessionUser();

  const isAuthorized = !userId || id === userId;

  return (
    <Fragment>
      {isAuthorized && children}
    </Fragment>
  );
};
