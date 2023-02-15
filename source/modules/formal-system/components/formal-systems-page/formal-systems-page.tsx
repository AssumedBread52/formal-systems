import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { HyperLink } from '@/common/components/hyper-link/hyper-link';
import { Input } from '@/common/components/input/input';
import { Typography } from '@/common/components/typography/typography';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';

export const FormalSystemsPage = (): ReactElement => {
  const { status } = useSession();

  const isAuthenticated = 'authenticated' === status;

  return (
    <Box px='5'>
      <section>
        <Typography as='h1' textAlign='center' position='relative' my='3'>
          Formal Systems
          {isAuthenticated && (
            <HyperLink position='absolute' right='0' fontSize='formButton' href='/'>
              Create New
            </HyperLink>
          )}
        </Typography>
        <Flex display='flex' mx='auto' width='7'>
          <label htmlFor='keywords'>
            Search
          </label>
          <Box mx='1' />
          <Input id='keywords' type='text' width='100%' />
        </Flex>
        <div>
          Pagination Controls
        </div>
        <div>
          Results Area
        </div>
        <div>
          Pagination Controls
        </div>
      </section>
    </Box>
  );
};
