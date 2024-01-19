import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { System } from '@/system/types/system';
import Link from 'next/link';
import { ReactElement } from 'react';

export const AddLink = (props: Pick<System, 'id'>): ReactElement => {
  const { id } = props;

  return (
    <ProtectedContent>
      <Link href={`/formal-system/${id}/symbol/add`}>
        Add Symbol
      </Link>
    </ProtectedContent>
  );
};