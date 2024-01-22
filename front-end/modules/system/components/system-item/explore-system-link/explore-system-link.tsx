'use client';

import { System } from '@/system/types/system';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement } from 'react';

export const ExploreSystemLink = (props: Pick<System, 'id'>): ReactElement => {
  const { id } = props;

  const pathname = usePathname();

  const explorePath = `/formal-system/${id}`;

  return (
    <Link hidden={pathname === explorePath} href={explorePath}>
      Explore
    </Link>
  );
};
