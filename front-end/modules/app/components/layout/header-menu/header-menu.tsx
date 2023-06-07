'use client';

import { Menu } from 'antd';
import { ItemType, MenuItemType } from 'antd/es/menu/hooks/useItems';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement } from 'react';

export const HeaderMenu = (): ReactElement => {
  const pathname = usePathname();

  const items = [
    { label: <Link href='/'>Formal Systems</Link>, key: '/', title: 'Search Formal Systems' },
    { label: <Link href='/info'>Info</Link>, key: '/info', title: 'What are Formal Systems' },
  ] as ItemType<MenuItemType>[];

  return (
    <Menu defaultSelectedKeys={[pathname]} mode='horizontal' items={items} theme='dark' />
  );
};
