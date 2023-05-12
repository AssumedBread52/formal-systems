import { theme } from '@/app/constants';
import { appStore } from '@/app/store';
import { AuthProvider } from '@/auth/components';
import { SystemProvider } from '@/system/components';
import { UserProvider } from '@/user/components';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { Fragment, ReactElement } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { Layout } from './layout/layout';

export const ProviderApp = (props: AppProps): ReactElement => {
  const { Component, pageProps } = props;

  return (
    <Fragment>
      <Head>
        <title>
          Formal Systems
        </title>
        <meta charSet='utf-8' />
        <meta name='application-name' content='Formal Systems' />
        <meta name='description' content='This is a fun, interactive environment that enables users to learn about formal systems.' />
        <meta name='generator' content='Styled Components, Styled System, KaTeX, Next JS, RTK Query, NextAuth, BcryptJS, MongoDB' />
        <meta name='keywords' content='Formal System, Proof, Theorem, Deduction, Logic' />
        <meta name='referrer' content='strict-origin-when-cross-origin' />
        <meta name='classification' content='Proofs, Theorems, Deductions, Formal Systems, Interactive Learning' />
        <meta name='distribution' content='Global' />
        <meta name='rating' content='General' />
        <meta name='robots' content='index, nofollow' />
        <meta name='revisit-after' content='1 day' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='author' content='Antonio Sanchez' />
        <meta name='creator' content='Antonio Sanchez' />
        <meta name='publisher' content='Antonio Sanchez' />
      </Head>
      <Provider store={appStore}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <SystemProvider>
              <UserProvider>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </UserProvider>
            </SystemProvider>
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </Fragment>
  );
};
