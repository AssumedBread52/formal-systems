import { Fragment, PropsWithChildren, ReactElement } from 'react';
import { Footer } from './footer/footer';
import { GlobalStyle } from './global-style/global-style';
import { Header } from './header/header';

export const Layout = (props: PropsWithChildren<{}>): ReactElement => {
  const { children } = props;

  return (
    <Fragment>
      <GlobalStyle />
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </Fragment>
  );
};
