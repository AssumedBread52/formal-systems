import { Flex } from '@/common/components/flex/flex';
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
      <Flex display='flex' flexDirection='column' justifyContent='space-between' minHeight='calc(100vh - 4rem)'>
        <main>
          {children}
        </main>
        <Footer />
      </Flex>
    </Fragment>
  );
};
