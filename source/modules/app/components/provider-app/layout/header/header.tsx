import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { HyperLink } from '@/common/components/hyper-link/hyper-link';
import { Typography } from '@/common/components/typography/typography';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { MouseEvent, ReactElement } from 'react';

export const Header = (): ReactElement => {
  const { pathname, push } = useRouter();

  const { status } = useSession();

  const clickHandler = (event: MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    push('/');
  };

  const isAuthenticated = 'authenticated' === status;

  return (
    <header>
      <Flex alignItems='center' display='flex' px='2' height='4'>
        <Box cursor='pointer' mx='2' onClick={clickHandler}>
          <Typography as='h2' my='auto'>
            <HyperLink color={pathname === '/' ? 'white' : 'inherit'} href='/'>
              Formal Systems
            </HyperLink>
          </Typography>
        </Box>
        <Box mx='auto' />
        <Box mx='2'>
          <HyperLink color={pathname === '/info' ? 'white' : 'inherit'} href='/info'>
            Info
          </HyperLink>
        </Box>
        <Box mx='2'>
          {isAuthenticated && (
            <HyperLink color={pathname === '/sign-out' ? 'white' : 'inherit'} href='/sign-out'>
              Sign Out
            </HyperLink>
          ) || (
            <HyperLink color={pathname === '/sign-in' ? 'white' : 'inherit'} href='/sign-in'>
              Sign In
            </HyperLink>
          )}
        </Box>
        <Box mx='2'>
          {isAuthenticated && (
            <HyperLink color={pathname === '/edit-profile' ? 'white' : 'inherit'} href='/edit-profile'>
              Edit Profile
            </HyperLink>
          ) || (
            <HyperLink color={pathname === '/sign-up' ? 'white' : 'inherit'} href='/sign-up'>
              Sign Up
            </HyperLink>
          )}
        </Box>
      </Flex>
    </header>
  );
};
