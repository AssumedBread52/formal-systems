import { Box } from '@/common/components/box/box';
import { FormActions } from '@/common/components/form-actions/form-actions';
import { Typography } from '@/common/components/typography/typography';
import { useDeleteFormalSystem } from '@/formal-system/hooks';
import { ClientFormalSystem } from '@/formal-system/types';
import { FormEvent, ReactElement } from 'react';

export const DeleteFormalSystemPage = (props: ClientFormalSystem): ReactElement => {
  const { id, title } = props;

  const { deleteFormalSystem, errorMessage, isLoading } = useDeleteFormalSystem();

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    deleteFormalSystem({
      id
    });
  };

  return (
    <Box mx='auto' px='4' width='7'>
      <section>
        <Typography as='h1' textAlign='center' my='3'>
          Delete Formal System: {title}
        </Typography>
        <form onSubmit={submitHandler}>
          <FormActions disableSubmit={false} submitTitle='Delete' isLoading={isLoading} errorMessage={errorMessage} />
        </form>
      </section>
    </Box>
  );
};
