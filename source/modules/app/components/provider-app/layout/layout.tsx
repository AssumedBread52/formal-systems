import { theme } from '@/app/constants';
import { useIsDocumentScrolled, useMainHeight } from '@/app/hooks';
import { Box } from '@/common/components/box/box';
import { Fragment, PropsWithChildren, ReactElement } from 'react';
import { Footer } from './footer/footer';
import { GlobalStyle } from './global-style/global-style';
import { Header } from './header/header';

export const Layout = (props: PropsWithChildren<{}>): ReactElement => {
  const { children } = props;

  const { height, headerRef, footerRef } = useMainHeight();

  const isDocumentScrolled = useIsDocumentScrolled();

  const boxShadow = isDocumentScrolled ? 'headerScrolled' : 'headerUnscrolled';
  
  const marginIndex = 4;

  return (
    <Fragment>
      <GlobalStyle />
      <Box ref={headerRef} backgroundColor='nonMainBackground' color='nonMainText' boxShadow={boxShadow} transition='headerShadow' minWidth='7' position='sticky' top='0' zIndex='nonMain'>
        <Header />
      </Box>
      <Box my={marginIndex} minHeight={`calc(100vh - ${height}px - ${theme.space[marginIndex]} - ${theme.space[marginIndex]})`}>
        <main>
          {children}
        </main>
      </Box>
      <Box ref={footerRef} backgroundColor='nonMainBackground' color='nonMainText' minWidth='7' position='relative' zIndex='nonMain'>
        <Footer />
      </Box>
    </Fragment>
  );
};
