import { Box } from '@/common/components/box/box';
import { Button } from '@/common/components/button/button';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { Flex } from '@/common/components/flex/flex';
import { LoadingSpinner } from '@/common/components/loading-spinner/loading-spinner';
import { Typography } from '@/common/components/typography/typography';
import { FormActionsProps } from '@/common/types';
import { ReactElement } from 'react';

export const FormActions = (props: FormActionsProps): ReactElement => {
  const { disableSubmit, submitTitle, isLoading, errorMessage } = props;

  return (
    <Flex display='flex' flexDirection='column' alignItems='center' my='2'>
      <Button disabled={disableSubmit} fontSize='formButton' height='3' width='5' position='relative' type='submit'>
        {submitTitle}
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
  );
};
