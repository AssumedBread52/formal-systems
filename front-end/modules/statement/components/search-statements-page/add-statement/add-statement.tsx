import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { Statement } from '@/statement/types/statement';
import { ReactElement } from 'react';
import { AddButton } from './add-button/add-button';

export const AddStatement = (props: Pick<Statement, 'createdByUserId'>): ReactElement => {
  const { createdByUserId } = props;

  return (
    <ProtectedContent userId={createdByUserId}>
      <AddButton />
    </ProtectedContent>
  );
};
