'use client';

import { Statement } from '@/statement/types/statement';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement } from 'react';

export const ExploreStatementLink = (props: Pick<Statement, 'id' | 'systemId'>): ReactElement => {
  const { id, systemId } = props;

  const pathname = usePathname();

  const explorePath = `/formal-system/${systemId}/statement/${id}`;

  return (
    <Link hidden={pathname === explorePath} href={explorePath}>
      Explore
    </Link>
  );
};
