import { Fragment, PropsWithChildren, ReactElement } from 'react';
import { GlobalStyle } from './global-style/global-style';
import { Header } from './header/header';

export const Layout = (props: PropsWithChildren<{}>): ReactElement => {
  const { children } = props;

  return (
    <Fragment>
      <GlobalStyle />
      <Header />
      <main style={{ height: '1000px' }}>
        {children}
      </main>
      <footer />
    </Fragment>
  );
};
