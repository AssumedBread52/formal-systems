'use client';

import { useIsAuthenticated } from '@/auth/hooks/use-is-authenticated';
import { AntdMenu } from '@/common/components/antd-menu/antd-menu';
import { ItemType, MenuItemType } from 'antd/es/menu/hooks/useItems';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement } from 'react';

export const HeaderMenu = (): ReactElement => {
  const isAuthenticated = useIsAuthenticated();

  const pathname = usePathname();

  const items = [
    {
      key: '/formal-systems',
      label: (
        <Link href='/formal-systems'>
          Formal Systems
        </Link>
      ),
      title: 'Search Formal Systems'
    },
    {
      key: '/info',
      label: (
        <Link href='/info'>
          Info
        </Link>
      ),
      title: 'What are Formal Systems?'
    }
  ] as ItemType<MenuItemType>[];

  if (isAuthenticated) {
    items.push({
      key: '/sign-out',
      label: (
        <Link href='/sign-out'>
          Sign Out
        </Link>
      ),
      title: 'Sign Out'
    }, {
      key: '/edit-profile',
      label: (
        <Link href='/edit-profile'>
          Edit Profile
        </Link>
      ),
      title: 'Edit Your Profile'
    });
  } else {
    items.push({
      key: '/sign-in',
      label: (
        <Link href='/sign-in'>
          Sign In
        </Link>
      ),
      title: 'Sign In'
    }, {
      key: '/sign-up',
      label: (
        <Link href='/sign-up'>
          Sign Up
        </Link>
      ),
      title: 'Sign Up'
    });
  }

  return (
    <AntdMenu items={items} mode='horizontal' selectedKeys={[pathname]} theme='dark' />
  );
};
