import { Box } from '@/common/components/box/box';
import { ReactElement } from 'react';
import { FormalSystems } from './formal-systems/formal-systems';
import { Preliminaries } from './preliminaries/preliminaries';
import { Statements } from './statements/statements';
import { Substitution } from './substitution/substitution';
import { Terms } from './terms/terms';

export const Info = (): ReactElement => {
  return (
    <Box mx='5' my='3'>
      <section>
        <h2>
          The Formal Description
        </h2>
        <Preliminaries />
        <Terms />
        <Substitution />
        <Statements />
        <FormalSystems />
      </section>
    </Box>
  );
};
