import { UserProvider } from '@/user/components/user-provider/user-provider';
import { AppProps } from 'next/app';
import { ReactElement } from 'react';

export const AppProvider = (props: AppProps): ReactElement => {
  const { Component, pageProps } = props;

  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
};
