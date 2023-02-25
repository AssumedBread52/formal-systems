import { Box } from '@/common/components/box/box';
import { Typography } from '@/common/components/typography/typography';
import { ClientFormalSystem } from '@/formal-system/types';
import { CreatedBySignature } from '@/user/components/created-by-signature/created-by-signature';
import { ReactElement } from 'react';

export const FormalSystemPage = (props: ClientFormalSystem): ReactElement => {
  const { title, description, createdByUserId } = props;

  return (
    <Box px='5' minWidth='8'>
      <section>
        <Typography as='h1'>
          {title}
        </Typography>
        <Typography as='p'>
          {description}
        </Typography>
        <CreatedBySignature userId={createdByUserId} />
      </section>
      <section>
        Symbols
      </section>
      <section>
        Axiomatic Statements
      </section>
    </Box>
  );
};
