import { Box } from '@/common/components/box/box';
import { ClientFormalSystem } from '@/formal-system/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import { FormalSystemItem } from './formal-system-item/formal-system-item';

export const FormalSystemsList = (props: {
  formalSystems: ClientFormalSystem[];
}): ReactElement => {
  const { formalSystems } = props;

  const { status } = useSession();

  return (
    <Box my='3'>
      {0 === formalSystems.length && 'authenticated' === status && (
        'No formal systems were found matching your search criteria. Either alter your search criteria or create a new formal system.'
      )}
      {0 === formalSystems.length && 'authenticated' !== status && (
        'No formal systems were found matching your search criteria. Either alter your search criteria or login/signup and then create a new formal system.'
      )}
      {formalSystems.map((formalSystem: ClientFormalSystem): ReactElement => {
        const { id, title, urlPath, description, createdByUserId } = formalSystem;

        return (
          <FormalSystemItem key={id} id={id} title={title} urlPath={urlPath} description={description} createdByUserId={createdByUserId} />
        );
      })}
    </Box>
  );
};
