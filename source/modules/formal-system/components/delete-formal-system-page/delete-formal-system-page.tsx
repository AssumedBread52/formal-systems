import { FormActions } from '@/common/components/form-actions/form-actions';
import { MutationPage } from '@/common/components/mutation-page/mutation-page';
import { useDeleteFormalSystem } from '@/formal-system/hooks';
import { ClientFormalSystem } from '@/formal-system/types';
import { ReactElement } from 'react';

export const DeleteFormalSystemPage = (props: ClientFormalSystem): ReactElement => {
  const { id, title } = props;

  const { deleteFormalSystem, errorMessage, isLoading } = useDeleteFormalSystem();

  const submitHandler = (): void => {
    deleteFormalSystem({
      id
    });
  };

  return (
    <MutationPage title={`Delete Formal System: ${title}`} onSubmit={submitHandler}>
      <FormActions disableSubmit={false} submitTitle='Delete' isLoading={isLoading} errorMessage={errorMessage} />
    </MutationPage>
  );
};
