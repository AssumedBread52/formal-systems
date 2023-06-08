'use client';

import { useIsAuthorized } from '@/auth/hooks/use-is-authorized';
import { AntdMenu } from '@/common/components/antd-menu/antd-menu';
import { ItemType, MenuItemType } from 'antd/es/menu/hooks/useItems';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement } from 'react';

export const HeaderMenu = (): ReactElement => {
  const pathname = usePathname();

  const isAuthorized = useIsAuthorized();

  const items = [
    { key: '/', label: <Link href='/'>Formal Systems</Link>, title: 'Search Formal Systems' },
    { key: '/info', label: <Link href='/info'>Info</Link>, title: 'What are Formal Systems' },
  ] as ItemType<MenuItemType>[];

  if (isAuthorized) {
    items.push({
      key: '/sign-out',
      label: <Link href='/sign-out'>Sign Out</Link>,
      title: 'Sign Out'
    }, {
      key: '/edit-profile',
      label: <Link href='/edit-profile'>Edit Profile</Link>,
      title: 'Edit Your Profile'
    });
  } else {
    items.push({
      key: '/sign-in',
      label: <Link href='/sign-in'>Sign In</Link>,
      title: 'Sign In'
    }, {
      key: '/sign-up',
      label: <Link href='/sign-up'>Sign Up</Link>,
      title: 'Sign Up'
    });
  }

  return (
    <AntdMenu selectedKeys={[pathname]} mode='horizontal' items={items} theme='dark' />
  );
};
