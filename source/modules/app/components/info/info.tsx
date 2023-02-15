import { Box } from '@/common/components/box/box';
import { Typography } from '@/common/components/typography/typography';
import { ReactElement } from 'react';
import { useWindowWidth } from '@/app/hooks';
import { FormalSystems } from './formal-systems/formal-systems';
import { Preliminaries } from './preliminaries/preliminaries';
import { Statements } from './statements/statements';
import { Substitution } from './substitution/substitution';
import { Terms } from './terms/terms';

export const Info = (): ReactElement => {
  const windowWidth = useWindowWidth();

  return (
    <Box px={windowWidth < 625 ? 3 : 5} minWidth='7'>
      <section>
        <Typography as='h1' textAlign='center'>
          The Formal Description
        </Typography>
        <Preliminaries />
        <Terms />
        <Substitution />
        <Statements />
        <FormalSystems />
      </section>
    </Box>
  );
};
