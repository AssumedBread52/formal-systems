import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { Symbol } from '@/symbol/types/symbol';
import { ReactElement } from 'react';
import { EditButton } from './edit-button/edit-button';

export const EditSymbol = (props: Pick<Symbol, 'id' | 'title' | 'description' | 'type' | 'content' | 'systemId' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, type, content, systemId, createdByUserId } = props;

  return (
    <ProtectedContent userId={createdByUserId}>
      <EditButton id={id} newTitle={title} newDescription={description} newType={type} newContent={content} systemId={systemId} />
    </ProtectedContent>
  );
};
