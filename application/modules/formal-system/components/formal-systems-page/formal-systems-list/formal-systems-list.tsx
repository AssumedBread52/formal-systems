import { ProtectedContent } from '@/auth/components';
import { Box } from '@/common/components/box/box';
import { ClientFormalSystem, FormalSystemsListProps } from '@/formal-system/types';
import { Fragment, ReactElement } from 'react';
import { FormalSystemItem } from './formal-system-item/formal-system-item';

export const FormalSystemsList = (props: FormalSystemsListProps): ReactElement => {
  const { formalSystems } = props;

  return (
    <Box my='3'>
      {0 === formalSystems.length && (
        <Fragment>
          <ProtectedContent>
            No formal systems were found matching your search criteria. Either alter your search criteria or create a new formal system.
          </ProtectedContent>
          <ProtectedContent invert>
            No formal systems were found matching your search criteria. Either alter your search criteria or login/signup and then create a new formal system.
          </ProtectedContent>
        </Fragment>
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
