import { Box } from '@/common/components/box/box';
import { FormActions } from '@/common/components/form-actions/form-actions';
import { InputField } from '@/common/components/input-field/input-field';
import { TextareaField } from '@/common/components/textarea-field/textarea-field';
import { Typography } from '@/common/components/typography/typography';
import { buildUrlPath, hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { useCreateFormalSystem } from '@/formal-system/hooks';
import { FormEvent, ReactElement } from 'react';

export const CreateFormalSystemPage = (): ReactElement => {
  const [title, titleHasError, setTitle] = useInputValue(hasText);
  const [description, descriptionHasError, setDescription] = useInputValue(hasText);

  const { createFormalSystem, errorMessage, isLoading } = useCreateFormalSystem();

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    createFormalSystem({
      title,
      description
    });
  };

  const disableSubmit = titleHasError || descriptionHasError;

  return (
    <Box mx='auto' px='4' width='7'>
      <section>
        <Typography as='h1' textAlign='center' my='3'>
          Create Formal System
        </Typography>
        <form onSubmit={submitHandler}>
          <InputField label='Title' value={title} hasError={titleHasError} type='text' updateValue={setTitle} />
          <InputField label='URL Path' value={buildUrlPath(title)} type='text' />
          <TextareaField label='Description' value={description} hasError={descriptionHasError} updateValue={setDescription} />
          <FormActions disableSubmit={disableSubmit} submitTitle='Create' isLoading={isLoading} errorMessage={errorMessage} />
        </form>
      </section>
    </Box>
  );
};
