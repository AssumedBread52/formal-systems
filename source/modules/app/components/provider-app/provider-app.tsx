import { AppProps } from 'next/app';
import { Fragment, ReactElement } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/app/constants';
import { GlobalStyle } from './global-style/global-style';

export const ProviderApp = (props: AppProps): ReactElement => {
  const Component = props.Component;
  const pageProps = props.pageProps;

  return (
    <Fragment>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <header />
        <main>
          <Component {...pageProps} />
        </main>
        <footer />
      </ThemeProvider>
    </Fragment>
  );
};
