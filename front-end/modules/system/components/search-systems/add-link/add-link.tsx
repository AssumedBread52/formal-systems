import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import Link from 'next/link';
import { ReactElement } from 'react';

export const AddLink = (): ReactElement => {
  return (
    <ProtectedContent>
      <Link href='/formal-system/add'>
        Add Formal System
      </Link>
    </ProtectedContent>
  );
};
