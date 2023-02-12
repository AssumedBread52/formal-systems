import { useIsDocumentScrolled, useMainHeight } from '@/app/hooks';
import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { Fragment, PropsWithChildren, ReactElement } from 'react';
import { Footer } from './footer/footer';
import { GlobalStyle } from './global-style/global-style';
import { Header } from './header/header';

export const Layout = (props: PropsWithChildren<{}>): ReactElement => {
  const { children } = props;

  const { height, headerRef, footerRef } = useMainHeight();

  const isDocumentScrolled = useIsDocumentScrolled();

  const boxShadow = isDocumentScrolled ? 'headerScrolled' : 'headerUnscrolled';

  return (
    <Fragment>
      <GlobalStyle />
      <Box ref={headerRef} backgroundColor='nonMainBackground' color='nonMainText' boxShadow={boxShadow} transition='headerShadow' position='sticky' top='0' zIndex='nonMain'>
        <Header />
      </Box>
      <Flex display='flex' justifyContent='center' minHeight={`calc(100vh - ${height}px)`}>
        <main>
          {children}
        </main>
      </Flex>
      <Box ref={footerRef} position='relative' backgroundColor='nonMainBackground' color='nonMainText' zIndex='nonMain'>
        <Footer />
      </Box>
    </Fragment>
  );
};
