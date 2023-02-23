import { Box } from '@/common/components/box/box';
import { Button } from '@/common/components/button/button';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { Flex } from '@/common/components/flex/flex';
import { LoadingSpinner } from '@/common/components/loading-spinner/loading-spinner';
import { Typography } from '@/common/components/typography/typography';
import { useDeleteFormalSystem } from '@/formal-system/hooks';
import { ClientFormalSystem } from '@/formal-system/types';
import { MouseEvent, ReactElement } from 'react';

export const DeleteFormalSystemPage = (props: ClientFormalSystem): ReactElement => {
  const { id, title } = props;

  const { deleteFormalSystem, errorMessage, isLoading } = useDeleteFormalSystem();

  const deleteClickHandler = (event: MouseEvent<HTMLButtonElement>): void => {
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
        <Flex display='flex' flexDirection='column' alignItems='center' my='2'>
          <Button fontSize='formButton' height='3' width='5' position='relative' onClick={deleteClickHandler}>
            Delete
            {isLoading && (
              <Box position='absolute' top='0' left='5' mx='2'>
                <LoadingSpinner />
              </Box>
            )}
          </Button>
          <Box my='1' />
          <CancelButton />
          <Typography as='p' color='red' height='2'>
            {errorMessage}
          </Typography>
        </Flex>
      </section>
    </Box>
  );
};
