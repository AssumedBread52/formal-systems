import { ClientFormalSystem } from '@/formal-system/types';
import { Fragment, ReactElement } from 'react';

export const FormalSystemsList = (props: {
  formalSystems: ClientFormalSystem[];
}): ReactElement => {
  const { formalSystems } = props;

  return (
    <Fragment>
      {formalSystems.map((formalSystem: ClientFormalSystem): string => {
        const { title } = formalSystem;

        return title;
      })}
    </Fragment>
  );
};
