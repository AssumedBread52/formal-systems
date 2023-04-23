import { InputField } from '@/common/components/input-field/input-field';
import { MutationPage } from '@/common/components/mutation-page/mutation-page';
import { TextareaField } from '@/common/components/textarea-field/textarea-field';
import { buildUrlPath, hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { useUpdateFormalSystem } from '@/formal-system/hooks';
import { ClientFormalSystem } from '@/formal-system/types';
import { ReactElement } from 'react';

export const UpdateFormalSystemPage = (props: ClientFormalSystem): ReactElement => {
  const { id, title, description } = props;

  const [newTitle, titleHasError, setTitle] = useInputValue(hasText, title);
  const [newDescription, descriptionHasError, setDescription] = useInputValue(hasText, description);

  const { updateFormalSystem, errorMessage, isLoading } = useUpdateFormalSystem();

  const submitHandler = (): void => {
    updateFormalSystem({
      id,
      title: newTitle,
      description: newDescription
    });
  };

  const disableSubmit = titleHasError && descriptionHasError;

  return (
    <MutationPage title={`Edit Formal System: ${title}`} disableSubmit={disableSubmit} submitTitle='Save Changes' isLoading={isLoading} errorMessage={errorMessage} onSubmit={submitHandler}>
      <InputField label='Title' value={newTitle} hasError={titleHasError} type='text' updateValue={setTitle} />
      <InputField label='URL Path' value={buildUrlPath(newTitle)} type='text' />
      <TextareaField label='Description' value={newDescription} hasError={descriptionHasError} updateValue={setDescription} />
    </MutationPage>
  );
};
