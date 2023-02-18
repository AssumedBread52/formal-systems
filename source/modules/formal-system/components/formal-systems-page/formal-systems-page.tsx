import { Box } from '@/common/components/box/box';
import { HyperLink } from '@/common/components/hyper-link/hyper-link';
import { PaginationControls } from '@/common/components/pagination-controls/pagination-controls';
import { Typography } from '@/common/components/typography/typography';
import { useReadFormalSystemsQuery } from '@/formal-system/hooks';
import { ClientFormalSystem } from '@/formal-system/types';
import { useSession } from 'next-auth/react';
import { ReactElement, useState } from 'react';

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
            <HyperLink position='absolute' right='0' fontSize='formButton' href='/create-formal-system'>
              Create New
            </HyperLink>
          )}
        </Typography>
        <PaginationControls total={data?.total ?? 0} count={count} setPage={setPage} setCount={setCount} setKeywords={setKeywords} />
        {isError && (
          'Failed to read formal systems.'
        )}
        {!(isError || isSuccess) && (
          'Pulsating Skeletons'
        )}
        {isSuccess && (
          data.results.map((result: ClientFormalSystem): string => {
            return result.title;
          })
        )}
        {isSuccess && (
          data.total
        )}
      </section>
    </Box>
  );
};
