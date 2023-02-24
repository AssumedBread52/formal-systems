import { FormActions } from '@/common/components/form-actions/form-actions';
import { InputField } from '@/common/components/input-field/input-field';
import { MutationPage } from '@/common/components/mutation-page/mutation-page';
import { TextareaField } from '@/common/components/textarea-field/textarea-field';
import { buildUrlPath, hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { useCreateFormalSystem } from '@/formal-system/hooks';
import { ReactElement } from 'react';

export const CreateFormalSystemPage = (): ReactElement => {
  const [title, titleHasError, setTitle] = useInputValue(hasText);
  const [description, descriptionHasError, setDescription] = useInputValue(hasText);

  const { createFormalSystem, errorMessage, isLoading } = useCreateFormalSystem();

  const submitHandler = (): void => {
    createFormalSystem({
      title,
      description
    });
  };

  const disableSubmit = titleHasError || descriptionHasError;

  return (
    <MutationPage title='Create Formal System' onSubmit={submitHandler}>
      <InputField label='Title' value={title} hasError={titleHasError} type='text' updateValue={setTitle} />
      <InputField label='URL Path' value={buildUrlPath(title)} type='text' />
      <TextareaField label='Description' value={description} hasError={descriptionHasError} updateValue={setDescription} />
      <FormActions disableSubmit={disableSubmit} submitTitle='Create' isLoading={isLoading} errorMessage={errorMessage} />
    </MutationPage>
  );
};
