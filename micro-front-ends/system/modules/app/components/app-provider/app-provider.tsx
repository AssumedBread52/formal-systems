import { SystemProvider } from '@/system/components/system-provider/system-provider';
import { AppProps } from 'next/app';
import { ReactElement } from 'react';

export const AppProvider = (props: AppProps): ReactElement => {
  const { Component, pageProps } = props;

  return (
    <SystemProvider>
      <Component {...pageProps} />
    </SystemProvider>
  );
};
