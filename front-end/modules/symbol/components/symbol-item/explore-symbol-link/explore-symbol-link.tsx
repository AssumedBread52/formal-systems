'use client';

import { Symbol } from '@/symbol/types/symbol';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement } from 'react';

export const ExploreSymbolLink = (props: Pick<Symbol, 'id' | 'systemId'>): ReactElement => {
  const { id, systemId } = props;

  const pathname = usePathname();

  const explorePath = `/formal-system/${systemId}/symbol/${id}`;

  return (
    <Link hidden={pathname === explorePath} href={explorePath}>
      Explore
    </Link>
  );
};
