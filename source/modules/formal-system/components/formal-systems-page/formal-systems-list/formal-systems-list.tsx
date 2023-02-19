import { ClientFormalSystem } from '@/formal-system/types';
import { Fragment, ReactElement } from 'react';

export const FormalSystemsList = (props: {
  list: ClientFormalSystem[];
}): ReactElement => {
  const { list } = props;

  return (
    <Fragment>
      {list.map((item: ClientFormalSystem): string => {
        const { title } = item;

        return title;
      })}
    </Fragment>
  );
};
