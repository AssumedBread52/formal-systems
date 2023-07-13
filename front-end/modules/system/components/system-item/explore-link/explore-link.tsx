import { System } from '@/system/types/system';
import Link from 'next/link';
import { ReactElement } from 'react';

export const ExploreLink = (props: Omit<System, 'description' | 'createdByUserId'>): ReactElement => {
  const { id, title } = props;

  return (
    <Link href={`/formal-system/${id}/${title}`}>
      Explore
    </Link>
  );
};
