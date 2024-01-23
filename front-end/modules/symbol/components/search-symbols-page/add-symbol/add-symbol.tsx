import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { Symbol } from '@/symbol/types/symbol';
import { ReactElement } from 'react';
import { AddButton } from './add-button/add-button';

export const AddSymbol = (props: Pick<Symbol, 'createdByUserId'>): ReactElement => {
  const { createdByUserId } = props;

  return (
    <ProtectedContent userId={createdByUserId}>
      <AddButton />
    </ProtectedContent>
  );
};
