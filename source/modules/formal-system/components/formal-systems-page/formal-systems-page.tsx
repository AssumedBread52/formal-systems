import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { HyperLink } from '@/common/components/hyper-link/hyper-link';
import { Input } from '@/common/components/input/input';
import { Typography } from '@/common/components/typography/typography';
import { useReadFormalSystemsQuery } from '@/formal-system/hooks';
import { useSession } from 'next-auth/react';
import { FormEvent, ReactElement, useEffect, useState } from 'react';

export const FormalSystemsPage = (): ReactElement => {
  const [terms, setTerms] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);

  const {} = useReadFormalSystemsQuery({
    page: 1,
    count: 10,
    keywords
  });

  useEffect((): (() => void) => {
    const termList = terms.trim().split(' ').filter((term: string): boolean => {
      return 0 !== term.length;
    });

    const delayedUpdate = setTimeout((): void => {
      setKeywords(termList);
    }, 300);

    return (): void => {
      clearTimeout(delayedUpdate);
    };
  }, [terms]);

  const { status } = useSession();

  const inputHandler = (event: FormEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setTerms(event.currentTarget.value);
  };

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
        <Flex display='flex' mx='auto' width='7'>
          <label htmlFor='keywords'>
            Search
          </label>
          <Box mx='1' />
          <Input id='keywords' type='text' width='100%' value={terms} onInput={inputHandler} />
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
