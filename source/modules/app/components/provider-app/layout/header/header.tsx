import { Flex } from '#/modules/common/components/flex/flex';
import { useIsDocumentScrolled } from '@/app/hooks';
import { Box } from '@/common/components/box/box';
import Link from 'next/link';
import { ReactElement } from 'react';

export const Header = (): ReactElement => {
  const isDocumentScrolled = useIsDocumentScrolled();

  return (
    <Box backgroundColor='white' position='sticky' top='0' left='0' width='100%' boxShadow={isDocumentScrolled ? '0px 4px 8px 0px #757d8829' : '0px 1px 2px 0px #757d8829'}>
      <header>
        <Flex alignItems='center' display='flex' px='2'>
          <h2>
            Formal Systems
          </h2>
          <Box mx='auto' />
          <Link href='/info'>
            Info
          </Link>
          <Box mx='1' />
          <a>Link to Sign In/Sign Out</a>
          <Box mx='1' />
          <a>Link to Sign Up/Edit Profile</a>
        </Flex>
      </header>
    </Box>
  );
};
