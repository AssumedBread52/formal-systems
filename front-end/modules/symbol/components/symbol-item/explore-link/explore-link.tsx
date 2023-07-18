import { Symbol } from '@/symbol/types/symbol';
import { SystemTitle } from '@/system/types/system-title';
import Link from 'next/link';
import { ReactElement } from 'react';

export const ExploreLink = (props: Omit<Symbol & SystemTitle, 'description' | 'type' | 'content' | 'axiomaticStatementAppearances' | 'nonAxiomaticStatementAppearances' | 'createdByUserId'>): ReactElement => {
  const { id, title, systemId, systemTitle } = props;

  return (
    <Link href={`/formal-system/${systemId}/${systemTitle}/symbol/${id}/${title}`}>
      Explore
    </Link>
  );
};
