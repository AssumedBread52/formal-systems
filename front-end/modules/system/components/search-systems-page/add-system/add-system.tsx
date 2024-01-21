import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { ReactElement } from 'react';
import { AddButton } from './add-button/add-button';

export const AddSystem = (): ReactElement => {
  return (
    <ProtectedContent>
      <AddButton />
    </ProtectedContent>
  );
};
