import { AuthProvider } from '@/auth/components/auth-provider/auth-provider';
import { AppProps } from 'next/app';
import { ReactElement } from 'react';

export const AppProvider = (props: AppProps): ReactElement => {
  const { Component, pageProps } = props;

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
};
