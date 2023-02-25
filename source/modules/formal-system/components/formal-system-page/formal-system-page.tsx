import { Box } from '@/common/components/box/box';
import { Flex } from '@/common/components/flex/flex';
import { HyperLink } from '@/common/components/hyper-link/hyper-link';
import { Typography } from '@/common/components/typography/typography';
import { ClientFormalSystem } from '@/formal-system/types';
import { CreatedBySignature } from '@/user/components/created-by-signature/created-by-signature';
import { useSession } from 'next-auth/react';
import { Fragment, ReactElement } from 'react';

export const FormalSystemPage = (props: ClientFormalSystem): ReactElement => {
  const { title, urlPath, description, createdByUserId } = props;

  const { data, status } = useSession();

  return (
    <Box px='5' minWidth='8'>
      <section>
        <Flex display='flex' alignItems='center'>
          <Typography as='h1' m='0'>
            {title}
          </Typography>
          <Box mx='auto' />
          {'authenticated' === status && createdByUserId === data.id && (
            <Fragment>
              <HyperLink title={`Edit ${title}`} href={`/${urlPath}/edit`}>
                Edit
              </HyperLink>
              <Box mx='1' />
              <HyperLink title={`Delete ${title}`} href={`/${urlPath}/delete`}>
                Delete
              </HyperLink>
            </Fragment>
          )}
        </Flex>
        <Typography as='p'>
          {description}
        </Typography>
        <CreatedBySignature userId={createdByUserId} />
      </section>
      <section>
        Link to Symbols interface
      </section>
      <section>
        Axiomatic Statements + Link to Axiomatic Statements interface
      </section>
      <section>
        Link to Definition Statements interface
      </section>
    </Box>
  );
};
