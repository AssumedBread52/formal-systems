import { useIsDocumentScrolled } from '@/app/hooks';
import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MouseEvent, ReactElement } from 'react';

export const Header = (): ReactElement => {
  const router = useRouter();

  const isDocumentScrolled = useIsDocumentScrolled();

  const clickHandler = (event: MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    router.push('/');
  };

  const boxShadow = isDocumentScrolled ? '0px 4px 8px 0px rgb(128 128 128 / 25%)' : '0px 1px 2px 0px rgb(128 128 128 / 25%)';

  return (
    <Box backgroundColor='white' position='sticky' top='0' left='0' width='100%' boxShadow={boxShadow} zIndex={1}>
      <header>
        <Flex alignItems='center' display='flex' px='3'>
          <Box cursor='pointer' onClick={clickHandler}>
            <h2>
              Formal Systems
            </h2>
          </Box>
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
