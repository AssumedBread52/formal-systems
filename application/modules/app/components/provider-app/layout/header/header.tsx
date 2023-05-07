import { ProtectedContent } from '@/auth/components';
import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { HyperLink } from '@/common/components/hyper-link/hyper-link';
import { Typography } from '@/common/components/typography/typography';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

export const Header = (): ReactElement => {
  const { pathname } = useRouter();

  return (
    <header>
      <Flex alignItems='center' display='flex' px='2' height='4'>
        <Typography as='h2' my='0'>
          <HyperLink title='Home-page' color={pathname === '/' ? 'white' : 'inherit'} href='/'>
            Formal Systems
          </HyperLink>
        </Typography>
        <Box mx='auto' />
        <Box mx='2'>
          <HyperLink title='What is a formal system?' color={pathname === '/info' ? 'white' : 'inherit'} href='/info'>
            Info
          </HyperLink>
        </Box>
        <Box mx='2'>
          <ProtectedContent>
            <HyperLink title='Confirm sign out' color={pathname === '/sign-out' ? 'white' : 'inherit'} href='/sign-out'>
              Sign Out
            </HyperLink>
          </ProtectedContent>
          <ProtectedContent invert>
            <HyperLink title='Sign in form' color={pathname === '/sign-in' ? 'white' : 'inherit'} href='/sign-in'>
              Sign In
            </HyperLink>
          </ProtectedContent>
        </Box>
        <Box mx='2'>
          <ProtectedContent>
            <HyperLink title='Edit profile form' color={pathname === '/edit-profile' ? 'white' : 'inherit'} href='/edit-profile'>
              Edit Profile
            </HyperLink>
          </ProtectedContent>
          <ProtectedContent invert>
            <HyperLink title='Sign up form' color={pathname === '/sign-up' ? 'white' : 'inherit'} href='/sign-up'>
              Sign Up
            </HyperLink>
          </ProtectedContent>
        </Box>
      </Flex>
    </header>
  );
};
