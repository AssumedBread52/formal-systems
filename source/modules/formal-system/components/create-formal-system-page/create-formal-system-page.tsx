import { Box } from '@/common/components/box/box';
import { Button } from '@/common/components/button/button';
import { Flex } from '@/common/components/flex/flex';
import { InputField } from '@/common/components/input-field/input-field';
import { LoadingSpinner } from '@/common/components/loading-spinner/loading-spinner';
import { TextareaField } from '@/common/components/textarea-field/textarea-field';
import { Typography } from '@/common/components/typography/typography';
import { buildUrlPath, hasText } from '@/common/helpers';
import { useInputValue } from '@/common/hooks';
import { useCreateFormalSystem } from '@/formal-system/hooks';
import { useRouter } from 'next/router';
import { FormEvent, MouseEvent, ReactElement } from 'react';

export const CreateFormalSystemPage = (): ReactElement => {
  const router = useRouter();

  const [title, titleHasError, setTitle] = useInputValue(hasText);
  const [description, descriptionHasError, setDescription] = useInputValue(hasText);

  const [createFormalSystem, isError, isLoading] = useCreateFormalSystem();

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    createFormalSystem({
      title,
      description
    });
  };

  const clickHandler = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    router.back();
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
          <Flex display='flex' flexDirection='column' alignItems='center' my='2'>
            <Button disabled={disableSubmit} fontSize='formButton' height='3' width='5' position='relative' type='submit'>
              Save
              {isLoading && (
                <Box position='absolute' top='0' left='5' mx='2'>
                  <LoadingSpinner />
                </Box>
              )}
            </Button>
            <Box my='1' />
            <Button title='Go back' fontSize='formButton' height='3' width='5' onClick={clickHandler}>
              Cancel
            </Button>
            <Typography as='p' color='red' height='2'>
              {isError && 'Failed to create formal system.'}
            </Typography>
          </Flex>
        </form>
      </section>
    </Box>
  );
};
