import { useSignOutUserMutation } from '@/auth/hooks';
import { Box } from '@/common/components/box/box';
import { Button } from '@/common/components/button/button';
import { Flex } from '@/common/components/flex/flex';
import { LoadingSpinner } from '@/common/components/loading-spinner/loading-spinner';
import { Typography } from '@/common/components/typography/typography';
import { useRouter } from 'next/router';
import { MouseEvent, ReactElement, useEffect } from 'react';

export const SignOutPage = (): ReactElement => {
  const router = useRouter();

  const [signOutUser, { isError, isLoading, isSuccess }] = useSignOutUserMutation();

  useEffect((): void => {
    if (isSuccess) {
      router.push('/');
    }
  }, [isSuccess, router]);

  const signOutClickHandler = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    signOutUser();
  };

  const cancelClickHandler = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    router.back();
  };

  return (
    <Box mx='auto' my='4' width='16rem'>
      <section>
        <Typography as='h1' textAlign='center' my='3'>
          Sign Out
        </Typography>
        <Flex display='flex' flexDirection='column' alignItems='center' my='3'>
          <Button fontSize='1rem' py='0.5rem' width='100%' onClick={signOutClickHandler}>
            Sign Out
          </Button>
          <Box my='1' />
          <Button fontSize='1rem' py='0.5rem' width='100%' onClick={cancelClickHandler}>
            Cancel
          </Button>
          <Typography as='p' color='red' height='1rem'>
            {isError && 'Failed to sign out.'}
          </Typography>
        </Flex>
        <Box>
          {isLoading && (
            <LoadingSpinner />
          )}
        </Box>
      </section>
    </Box>
  );
};
