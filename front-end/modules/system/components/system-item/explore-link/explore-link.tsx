import { System } from '@/system/types/system';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Fragment, ReactElement } from 'react';

export const ExploreLink = (props: Omit<System, 'description' | 'createdByUserId'>): ReactElement => {
  const { id, title } = props;

  const pathname = headers().get('x-invoke-path') ?? '';

  const descriptionPath = `/formal-system/${id}/${title}`;

  if (decodeURIComponent(pathname) === descriptionPath) {
    return (
      <Fragment />
    );
  }

  return (
    <Link href={descriptionPath}>
      Explore
    </Link>
  );
};
