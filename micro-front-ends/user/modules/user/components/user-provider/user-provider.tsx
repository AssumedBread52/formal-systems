import { userApi } from '@/user/user-api';
import { ApiProvider } from '@reduxjs/toolkit/dist/query/react';
import { PropsWithChildren, ReactElement } from 'react';

export const UserProvider = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  return (
    <ApiProvider api={userApi}>
      {children}
    </ApiProvider>
  );
};
