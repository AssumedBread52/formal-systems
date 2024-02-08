import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { Statement } from '@/statement/types/statement';
import { ReactElement } from 'react';
import { RemoveButton } from './remove-button/remove-button';

export const RemoveStatement = (props: Pick<Statement, 'id' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { id, systemId, createdByUserId } = props;

  return (
    <ProtectedContent userId={createdByUserId}>
      <RemoveButton id={id} systemId={systemId} />
    </ProtectedContent>
  );
};
