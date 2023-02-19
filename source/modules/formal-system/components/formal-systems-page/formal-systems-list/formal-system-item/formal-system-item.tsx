import { Box } from '@/common/components/box/box';
import { ClientFormalSystem } from '@/formal-system/types';
import { ReactElement } from 'react';

export const FormalSystemItem = (props: ClientFormalSystem): ReactElement => {
  const { title } = props;

  return (
    <Box>
      {title}
    </Box>
  );
};
