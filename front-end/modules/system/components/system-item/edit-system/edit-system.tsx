import { ProtectedContent } from '@/auth/components/protected-content/protected-content';
import { System } from '@/system/types/system';
import { ReactElement } from 'react';
import { EditButton } from './edit-button/edit-button';

export const EditSystem = (props: Pick<System, 'id' | 'title' | 'description' | 'createdByUserId'>): ReactElement => {
  const { id, title, description, createdByUserId } = props;

  return (
    <ProtectedContent userId={createdByUserId}>
      <EditButton id={id} newTitle={title} newDescription={description} />
    </ProtectedContent>
  );
};
