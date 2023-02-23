import { Box } from '@/common/components/box/box';
import { FormActions } from '@/common/components/form-actions/form-actions';
import { InputField } from '@/common/components/input-field/input-field';
import { TextareaField } from '@/common/components/textarea-field/textarea-field';
import { Typography } from '@/common/components/typography/typography';
import { buildUrlPath, hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { useUpdateFormalSystem } from '@/formal-system/hooks';
import { ClientFormalSystem } from '@/formal-system/types';
import { FormEvent, ReactElement } from 'react';

export const UpdateFormalSystemPage = (props: ClientFormalSystem): ReactElement => {
  const { id, title, description } = props;

  const [newTitle, titleHasError, setTitle] = useInputValue(hasText, title);
  const [newDescription, descriptionHasError, setDescription] = useInputValue(hasText, description);

  const { updateFormalSystem, errorMessage, isLoading } = useUpdateFormalSystem();

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    updateFormalSystem({
      id,
      title: newTitle,
      description: newDescription
    });
  };

  const disableSubmit = titleHasError && descriptionHasError;

  return (
    <Box mx='auto' px='4' width='7'>
      <section>
        <Typography as='h1' textAlign='center' my='3'>
          Edit Formal System
        </Typography>
        <form onSubmit={submitHandler}>
          <InputField label='Title' value={newTitle} hasError={titleHasError} type='text' updateValue={setTitle} />
          <InputField label='URL Path' value={buildUrlPath(title)} type='text' />
          <TextareaField label='Description' value={newDescription} hasError={descriptionHasError} updateValue={setDescription} />
          <FormActions disableSubmit={disableSubmit} submitTitle='Create' isLoading={isLoading} errorMessage={errorMessage} />
        </form>
      </section>
    </Box>
  );
};
