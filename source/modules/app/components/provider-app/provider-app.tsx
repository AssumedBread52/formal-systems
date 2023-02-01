import { AppProps } from 'next/app';
import { Fragment, ReactElement } from 'react';
import { GlobalStyle } from './global-style/global-style';

export const ProviderApp = (props: AppProps): ReactElement => {
  const Component = props.Component;
  const pageProps = props.pageProps;

  return (
    <Fragment>
      <GlobalStyle />
      <header />
      <main>
        <Component {...pageProps} />
      </main>
      <footer />
    </Fragment>
  );
};
