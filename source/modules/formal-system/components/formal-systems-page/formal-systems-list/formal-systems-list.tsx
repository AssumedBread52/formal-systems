import { Box } from '@/common/components/box/box';
import { ClientFormalSystem } from '@/formal-system/types';
import { ReactElement } from 'react';
import { FormalSystemItem } from './formal-system-item/formal-system-item';

export const FormalSystemsList = (props: {
  formalSystems: ClientFormalSystem[];
}): ReactElement => {
  const { formalSystems } = props;

  return (
    <Box my='3'>
      {formalSystems.map((formalSystem: ClientFormalSystem): ReactElement => {
        const { id, title, urlPath, description, createdByUserId } = formalSystem;

        return (
          <FormalSystemItem key={id} id={id} title={title} urlPath={urlPath} description={description} createdByUserId={createdByUserId} />
        );
      })}
    </Box>
  );
};
