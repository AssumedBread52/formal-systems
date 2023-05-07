import { ProtectedContent } from '@/auth/components';
import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { HyperLink } from '@/common/components/hyper-link/hyper-link';
import { PaginationControls } from '@/common/components/pagination-controls/pagination-controls';
import { Typography } from '@/common/components/typography/typography';
import { useReadFormalSystemsQuery } from '@/formal-system/hooks';
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

  return (
    <Box px='5' minWidth='8'>
      <section>
        <Flex display='flex' alignItems='center'>
          <Typography as='h1' my='2'>
            Formal Systems
          </Typography>
          <Box mx='auto' />
          <ProtectedContent>
            <HyperLink title='New formal system form' fontSize='formButton' href='/create-formal-system'>
              Create New
            </HyperLink>
          </ProtectedContent>
        </Flex>
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
