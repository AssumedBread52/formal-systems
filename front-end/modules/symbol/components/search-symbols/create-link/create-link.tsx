import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { System } from '@/system/types/system';
import Link from 'next/link';
import { ReactElement } from 'react';

export const CreateLink = (props: Pick<System, 'id' | 'title'>): ReactElement => {
  const { id, title } = props;

  return (
    <ProtectedContent>
      <Link href={`/formal-system/${id}/${title}/symbol/create`}>
        Create Symbol
      </Link>
    </ProtectedContent>
  );
};
