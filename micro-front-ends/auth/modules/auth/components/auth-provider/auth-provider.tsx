import { authApi } from '@/auth/auth-api';
import { ApiProvider } from '@reduxjs/toolkit/dist/query/react';
import { PropsWithChildren, ReactElement } from 'react';

export const AuthProvider = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  return (
    <ApiProvider api={authApi}>
      {children}
    </ApiProvider>
  );
};
