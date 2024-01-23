import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { Symbol } from '@/symbol/types/symbol';
import { ReactElement } from 'react';
import { RemoveButton } from './remove-button/remove-button';

export const RemoveSymbol = (props: Pick<Symbol, 'id' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { id, systemId, createdByUserId } = props;

  return (
    <ProtectedContent userId={createdByUserId}>
      <RemoveButton id={id} systemId={systemId} />
    </ProtectedContent>
  );
};
