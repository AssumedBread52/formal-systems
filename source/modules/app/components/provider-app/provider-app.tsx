import { theme } from '@/app/constants';
import { AppProps } from 'next/app';
import { Fragment, ReactElement } from 'react';
import { ThemeProvider } from 'styled-components';
import { Layout } from './layout/layout';

export const ProviderApp = (props: AppProps): ReactElement => {
  const Component = props.Component;
  const pageProps = props.pageProps;

  return (
    <Fragment>
      <ThemeProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </Fragment>
  );
};
