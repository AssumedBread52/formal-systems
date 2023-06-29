import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import Link from 'next/link';
import { ReactElement } from 'react';

export const CreateLink = (): ReactElement => {
  return (
    <ProtectedContent>
      <Link href='/formal-system/create'>
        Create
      </Link>
    </ProtectedContent>
  );
};
