import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { HyperLink } from '@/common/components/hyper-link/hyper-link';
import { PaginationControls } from '@/common/components/pagination-controls/pagination-controls';
import { Typography } from '@/common/components/typography/typography';
import { useReadFormalSystemsQuery } from '@/formal-system/hooks';
import { useSession } from 'next-auth/react';
import { ReactElement, useState } from 'react';
import { FormalSystemsList } from './formal-systems-list/formal-systems-list';

export const FormalSystemsPage = (): ReactElement => {
  const [page, setPage] = useState<number>(1);
  const [count, setCount] = useState<number>(10);
  const [keywords, setKeywords] = useState<string[]>([]);

  const { data, isError, isSuccess } = useReadFormalSystemsQuery({
    page,
    count,
    keywords
  });

  const { status } = useSession();

  const isAuthenticated = 'authenticated' === status;

  return (
    <Box px='5'>
      <section>
        <Typography as='h1' textAlign='center' position='relative' my='3'>
          Formal Systems
          {isAuthenticated && (
            <HyperLink title='New formal system form' position='absolute' right='0' fontSize='formButton' href='/create-formal-system'>
              Create New
            </HyperLink>
          )}
        </Typography>
        <PaginationControls total={data?.total ?? 0} page={page} count={count} updatePage={setPage} updateCount={setCount} updateKeywords={setKeywords} />
        {!(isError || isSuccess) && (
          'Pulsating Skeletons'
        )}
        {isError && (
          <Flex display='flex' justifyContent='center'>
            Failed to read formal systems.
          </Flex>
        )}
        {isSuccess && (
          <FormalSystemsList formalSystems={data.results} />
        )}
      </section>
    </Box>
  );
};
