import { SystemListProps } from '@/system/types/system-list-props';
import { ReactElement } from 'react';

export const SystemList = (props: SystemListProps): ReactElement => {
  const { systems } = props;

  return (
    <h1>
      {systems.length}
    </h1>
  );
};
