import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { Statement } from '@/statement/types/statement';
import { ReactElement } from 'react';
import { EditButton } from './edit-button/edit-button';

export const EditStatement = (props: Pick<Statement, 'id' | 'title' | 'description' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, systemId, createdByUserId } = props;

  return (
    <ProtectedContent userId={createdByUserId}>
      <EditButton id={id} newTitle={title} newDescription={description} systemId={systemId} />
    </ProtectedContent>
  );
};
