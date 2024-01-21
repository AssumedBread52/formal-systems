import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { System } from '@/system/types/system';
import { ReactElement } from 'react';
import { RemoveButton } from './remove-button/remove-button';

export const RemoveSystem = (props: Pick<System, 'id' | 'createdByUserId'>): ReactElement => {
  const { id, createdByUserId } = props;

  return (
    <ProtectedContent userId={createdByUserId}>
      <RemoveButton id={id} />
    </ProtectedContent>
  );
};
