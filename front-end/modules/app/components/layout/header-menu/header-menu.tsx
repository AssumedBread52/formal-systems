'use client';

import { useIsAuthorized } from '@/auth/hooks/use-is-authorized';
import { Menu } from 'antd';
import { ItemType, MenuItemType } from 'antd/es/menu/hooks/useItems';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement } from 'react';

export const HeaderMenu = (): ReactElement => {
  const pathname = usePathname();

  const isAuthorized = useIsAuthorized();

  const items = [
    { label: <Link href='/'>Formal Systems</Link>, key: '/', title: 'Search Formal Systems' },
    { label: <Link href='/info'>Info</Link>, key: '/info', title: 'What are Formal Systems' },
  ] as ItemType<MenuItemType>[];

  if (isAuthorized) {
    items.push({
      label: <Link href='/sign-out'>Sign Out</Link>,
      key: '/sign-out',
      title: 'Sign Out'
    }, {
      label: <Link href='/edit-profile'>Edit Profile</Link>,
      key: '/edit-profile',
      title: 'Edit Your Profile'
    });
  } else {
    items.push({
      label: <Link href='/sign-in'>Sign In</Link>,
      key: '/sign-in',
      title: 'Sign In'
    }, {
      label: <Link href='/sign-up'>Sign Up</Link>,
      key: '/sign-up',
      title: 'Sign Up'
    });
  }

  return (
    <Menu selectedKeys={[pathname]} mode='horizontal' items={items} theme='dark' />
  );
};
