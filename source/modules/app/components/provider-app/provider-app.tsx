import { AppProps } from 'next/app';
import { Fragment, ReactElement } from 'react';

export const ProviderApp = (props: AppProps): ReactElement => {
  const Component = props.Component;
  const pageProps = props.pageProps;

  return (
    <Fragment>
      <header />
      <main>
        <Component {...pageProps} />
      </main>
      <footer />
    </Fragment>
  );
};
